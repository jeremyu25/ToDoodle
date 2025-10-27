import query from "../db/index.js"
import crypto from "crypto"
import { createOAuthUsername } from "../utils/usernameUtils.js"
import folderModel from "./folder.model.js"

const TIMEOUT_DURATION = 9 * 60 * 1000 // 9 mins
const RESEND_WINDOW_MS = process.env.RESEND_WINDOW_MS ? parseInt(process.env.RESEND_WINDOW_MS) : 60 * 60 * 1000 // 1 hour
const MAX_RESENDS_PER_WINDOW = process.env.MAX_RESENDS_PER_WINDOW ? parseInt(process.env.MAX_RESENDS_PER_WINDOW) : 3

// Create staging user (unverified)
const createStagingUser = async (username, passwordhash, email) => {
  try {
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationExpires = new Date(Date.now() + TIMEOUT_DURATION)
    const userId = crypto.randomUUID()

    const result = await query(
      `INSERT INTO staging_users(id, username, password_hash, email, verification_token, verification_expires) 
       VALUES($1, $2, $3, $4, $5, $6) 
       RETURNING id, username, email, verification_token`,
      [userId, username, passwordhash, email, verificationToken, verificationExpires]
    )

    if (result.rows.length === 0) {
      throw new Error("Unable to create staging user.")
    }

    return result.rows[0]
  }
  catch (error) {
    throw error
  }
}

// Verify email and move user from staging to users table
const verifyEmailAndCreateUser = async (verificationToken) => {
  try {
    await query('BEGIN')

    // Find staging user by verification token
    const stagingUserResult = await query(
      `SELECT * FROM staging_users 
       WHERE verification_token = $1 AND verification_expires > NOW()`,
      [verificationToken]
    )

    if (stagingUserResult.rows.length === 0) {
      await query('ROLLBACK')
      throw new Error("Invalid or expired verification token.")
    }

    const stagingUser = stagingUserResult.rows[0]

    // Create verified user
    const userResult = await query(
      `INSERT INTO users(id, username, email) 
       VALUES($1, $2, $3) RETURNING id, username, email`,
      [stagingUser.id, stagingUser.username, stagingUser.email]
    )

    if (userResult.rows.length === 0) {
      await query('ROLLBACK')
      throw new Error("Unable to create verified user.")
    }

    const user = userResult.rows[0]

    // Create local auth identity
    await query(
      `INSERT INTO auth_identities(user_id, provider, provider_user_id, password_hash, provider_account_email) 
       VALUES($1, 'local', $2, $3, $4)`,
      [user.id, stagingUser.email, stagingUser.password_hash, stagingUser.email]
    )

    // Create default folder for new user (mark as default)
    await folderModel.createFolder(user.id, "Default", null, true)

    // Remove from staging users
    await query(
      `DELETE FROM staging_users WHERE id = $1`,
      [stagingUser.id]
    )

    await query('COMMIT')

    return user
  }
  catch (error) {
    await query('ROLLBACK')
    throw error
  }
}

// Get staging user by email
const getStagingUserByEmail = async (email) => {
  try {
    const result = await query(
      `SELECT id, username, email, verification_token, verification_expires 
       FROM staging_users WHERE email = $1`,
      [email]
    )
    return result.rows[0]
  }
  catch (error) {
    console.error("Error fetching staging user by email:", error.message)
    throw new Error("DB error while fetching staging user.")
  }
}

// Resend verification email (generate new token)
const regenerateVerificationToken = async (email) => {
  try {
    const select = await query(
      `SELECT id, username, email, verification_token, verification_expires, resend_count, resend_window_start 
       FROM staging_users WHERE email = $1`,
      [email]
    )

    if (select.rows.length === 0) {
      throw new Error("Staging user not found.")
    }

    const row = select.rows[0]
    const now = new Date()

    let windowStart = row.resend_window_start ? new Date(row.resend_window_start) : null
    let resendCount = row.resend_count || 0

    // Reset window if expired or not set
    if (!windowStart || (now - windowStart) > RESEND_WINDOW_MS) {
      windowStart = now
      resendCount = 0
    }

    const nextCount = resendCount + 1
    if (nextCount > MAX_RESENDS_PER_WINDOW) {
      const err = new Error("Resend throttled")
      err.code = 'THROTTLED'
      throw err
    }

    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationExpires = new Date(Date.now() + TIMEOUT_DURATION)

    const result = await query(
      `UPDATE staging_users 
       SET verification_token = $1, verification_expires = $2, resend_count = $3, resend_window_start = $4
       WHERE email = $5 
       RETURNING id, username, email, verification_token`,
      [verificationToken, verificationExpires, nextCount, windowStart, email]
    )

    if (result.rows.length === 0) {
      throw new Error("Staging user not found.")
    }

    return result.rows[0]
  }
  catch (error) {
    throw error
  }
}

// Clean up expired staging users (called by cron job every 10 minutes)
const cleanupExpiredStagingUsers = async () => {
  try {
    const result = await query(
      `DELETE FROM staging_users WHERE verification_expires < NOW() RETURNING id`
    )
    return result.rows.length
  }
  catch (error) {
    console.error("Error cleaning up expired staging users:", error.message)
    throw error
  }
}

const signUp = async (username, passwordhash, email) => {
  try {
    // Start a transaction
    await query('BEGIN')

    // Create user first
    const userResults = await query(
      `INSERT INTO users(username, email) 
       VALUES($1, $2) RETURNING id, username, email`,
      [username, email]
    )

    if (userResults.rows.length === 0) {
      await query('ROLLBACK')
      throw new Error("Unable to create user.")
    }

    const user = userResults.rows[0]

    // Create local auth identity
    await query(
      `INSERT INTO auth_identities(user_id, provider, provider_user_id, password_hash, provider_account_email) 
       VALUES($1, 'local', $2, $3, $4)`,
      [user.id, email, passwordhash, email]
    )

    await query('COMMIT')
    return user
  }
  catch (error) {
    await query('ROLLBACK')
    throw error
  }
}

const getUser = async (identifier, secondaryIdentifier = null) => {
  try {
    let query_text, params;

    if (secondaryIdentifier) {
      // Both email and username provided - verify they belong to the same user
      query_text = `SELECT u.id, u.username, u.email, ai.password_hash 
                    FROM users u
                    LEFT JOIN auth_identities ai ON u.id = ai.user_id AND ai.provider = 'local'
                    WHERE u.username = $1 AND u.email = $2`;
      params = [identifier, secondaryIdentifier];
    } else {
      query_text = `SELECT u.id, u.username, u.email, ai.password_hash 
                    FROM users u
                    LEFT JOIN auth_identities ai ON u.id = ai.user_id AND ai.provider = 'local'
                    WHERE u.username = $1 OR u.email = $1`;
      params = [identifier];
    }

    const results = await query(query_text, params);
    return results.rows[0];
  }
  catch (error) {
    console.error("Error fetching user from database:", error.message)
    throw new Error("DB error while fetching user.")
  }
}

const deleteUser = async (id) => {
  try {
    const results = await query(
      `DELETE FROM users WHERE id = $1 RETURNING id, username, email`,
      [id]
    )

    if (results.rows.length === 0) {
      throw new Error("User not found.")
    }

    return results.rows[0]
  }
  catch (error) {
    console.error("Error deleting user from database:", error.message)
    throw new Error("DB error while deleting user.")
  }
}

const getUserByEmail = async (email) => {
  try {
    const results = await query(
      `SELECT u.id, u.username, u.email 
       FROM users u WHERE u.email = $1`,
      [email]
    )
    return results.rows[0]
  }
  catch (error) {
    console.error("Error fetching user by email:", error.message)
    throw new Error("DB error while fetching user by email.")
  }
}

const createGoogleUser = async (userData) => {
  try {
    const { username, email, googleId } = userData

    // Generate username with 5-digit hash for OAuth users
    const finalUsername = createOAuthUsername(username, email)

    // Start a transaction
    await query('BEGIN')

    // Create user first
    const userResults = await query(
      `INSERT INTO users(username, email) 
       VALUES($1, $2) RETURNING id, username, email`,
      [finalUsername, email]
    )

    if (userResults.rows.length === 0) {
      await query('ROLLBACK')
      throw new Error("Unable to create Google user.")
    }

    const user = userResults.rows[0]

    // Create Google auth identity
    await query(
      `INSERT INTO auth_identities(user_id, provider, provider_user_id, provider_account_email) 
       VALUES($1, 'google', $2, $3)`,
      [user.id, googleId, email]
    )

    // Create default folder for new user (mark as default)
    await folderModel.createFolder(user.id, "Default", null, true)

    await query('COMMIT')
    return user
  }
  catch (error) {
    await query('ROLLBACK')
    console.error("Error creating Google user:", error.message)
    throw error
  }
}

// Generic function to get user by OAuth provider
const getUserByProvider = async (provider, providerUserId) => {
  try {
    const results = await query(
      `SELECT u.id, u.username, u.email 
       FROM users u
       JOIN auth_identities ai ON u.id = ai.user_id
       WHERE ai.provider = $1 AND ai.provider_user_id = $2`,
      [provider, providerUserId]
    )
    return results.rows[0]
  }
  catch (error) {
    console.error("Error fetching user by provider:", error.message)
    throw new Error("DB error while fetching user by provider.")
  }
}

// Generic function to create OAuth user
const createOAuthUser = async (userData) => {
  try {
    const { username, email, provider, providerUserId } = userData

    // Generate username with 5-digit hash for OAuth users
    const finalUsername = createOAuthUsername(username, email)

    // Start a transaction
    await query('BEGIN')

    // Create user first
    const userResults = await query(
      `INSERT INTO users(username, email) 
       VALUES($1, $2) RETURNING id, username, email`,
      [finalUsername, email]
    )

    if (userResults.rows.length === 0) {
      await query('ROLLBACK')
      throw new Error("Unable to create OAuth user.")
    }

    const user = userResults.rows[0]

    // Create OAuth auth identity
    await query(
      `INSERT INTO auth_identities(user_id, provider, provider_user_id, provider_account_email) 
       VALUES($1, $2, $3, $4)`,
      [user.id, provider, providerUserId, email]
    )

    // Create default folder for new user (mark as default)
    await folderModel.createFolder(user.id, "Default", null, true)

    await query('COMMIT')
    return user
  }
  catch (error) {
    await query('ROLLBACK')
    console.error("Error creating OAuth user:", error.message)
    throw error
  }
}

// Function to link new auth provider to existing user
const linkAuthProvider = async (userId, provider, providerUserId, passwordHash = null, providerAccountEmail = null) => {
  try {
    const results = await query(
      `INSERT INTO auth_identities(user_id, provider, provider_user_id, password_hash, provider_account_email) 
       VALUES($1, $2, $3, $4, $5) RETURNING id`,
      [userId, provider, providerUserId, passwordHash, providerAccountEmail]
    )

    if (results.rows.length === 0) {
      throw new Error("Unable to link auth provider.")
    }

    return results.rows[0]
  }
  catch (error) {
    console.error("Error linking auth provider:", error.message)
    throw error
  }
}

// Function to get all auth methods for a user
const getUserAuthMethods = async (userId) => {
  try {
    const results = await query(
        `SELECT ai.provider, ai.provider_user_id, ai.provider_account_email
         FROM auth_identities ai
         WHERE ai.user_id = $1`,
        [userId]
      )
    return results.rows
  }
  catch (error) {
    console.error("Error fetching user auth methods:", error.message)
    throw new Error("DB error while fetching user auth methods.")
  }
}

const removeAuthMethod = async (userId, provider, providerUserId = null) => {
  try {
    const results = await query(
      `DELETE FROM auth_identities 
      WHERE user_id = $1 AND provider = $2 AND provider_user_id = $3
      RETURNING provider, provider_user_id`,
      [userId, provider, providerUserId]
    )
    return results.rows[0]
  }
  catch (error) {
    console.error("Error removing auth method:", error.message)
    throw new Error("DB error while removing auth method.")
  }
}

// Get user by username
const getUserByUsername = async (username) => {
  try {
    const results = await query(
      `SELECT u.id, u.username, u.email 
       FROM users u WHERE u.username = $1`,
      [username]
    )
    return results.rows[0]
  }
  catch (error) {
    console.error("Error fetching user by username:", error.message)
    throw new Error("DB error while fetching user by username.")
  }
}

// Get user by ID
const getUserById = async (userId) => {
  try {
    const results = await query(
      `SELECT u.id, u.username, u.email 
       FROM users u WHERE u.id = $1`,
      [userId]
    )
    return results.rows[0]
  }
  catch (error) {
    console.error("Error fetching user by ID:", error.message)
    throw new Error("DB error while fetching user by ID.")
  }
}

// Get user with password for verification
const getUserWithPassword = async (userId) => {
  try {
    const results = await query(
      `SELECT u.id, u.username, u.email, ai.password_hash 
       FROM users u
       LEFT JOIN auth_identities ai ON u.id = ai.user_id AND ai.provider = 'local'
       WHERE u.id = $1`,
      [userId]
    )
    return results.rows[0]
  }
  catch (error) {
    console.error("Error fetching user with password:", error.message)
    throw new Error("DB error while fetching user with password.")
  }
}

// Update username
const updateUsername = async (userId, username) => {
  try {
    const results = await query(
      `UPDATE users SET username = $1 WHERE id = $2 
       RETURNING id, username, email`,
      [username, userId]
    )

    if (results.rows.length === 0) {
      throw new Error("User not found.")
    }

    return results.rows[0]
  }
  catch (error) {
    console.error("Error updating username:", error.message)
    throw new Error("DB error while updating username.")
  }
}

// Update email
const updateEmail = async (userId, email) => {
  try {
    await query('BEGIN')

    // Update user email
    const userResults = await query(
      `UPDATE users SET email = $1 WHERE id = $2 
       RETURNING id, username, email`,
      [email, userId]
    )

    if (userResults.rows.length === 0) {
      await query('ROLLBACK')
      throw new Error("User not found.")
    }

    // Update auth identity provider_user_id for local accounts
    await query(
      `UPDATE auth_identities SET provider_user_id = $1 
       WHERE user_id = $2 AND provider = 'local'`,
      [email, userId]
    )

    await query('COMMIT')
    return userResults.rows[0]
  }
  catch (error) {
    await query('ROLLBACK')
    console.error("Error updating email:", error.message)
    throw new Error("DB error while updating email.")
  }
}

// Update password
const updatePassword = async (userId, hashedPassword) => {
  try {
    const results = await query(
      `UPDATE auth_identities SET password_hash = $1 
       WHERE user_id = $2 AND provider = 'local'
       RETURNING user_id`,
      [hashedPassword, userId]
    )

    if (results.rows.length === 0) {
      throw new Error("Local auth identity not found for user.")
    }

    return results.rows[0]
  }
  catch (error) {
    console.error("Error updating password:", error.message)
    throw new Error("DB error while updating password.")
  }
}

// Create pending email change request
const createPendingEmailChange = async (userId, oldEmail, newEmail) => {
  try {
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationExpires = new Date(Date.now() + TIMEOUT_DURATION)
    const results = await query(
      `INSERT INTO pending_email_changes(user_id, old_email, new_email, verification_token, verification_expires, resend_count, resend_window_start) 
       VALUES($1, $2, $3, $4, $5, 1, $6) 
       ON CONFLICT (user_id) DO UPDATE SET 
         old_email = EXCLUDED.old_email,
         new_email = EXCLUDED.new_email,
         verification_token = EXCLUDED.verification_token,
         verification_expires = EXCLUDED.verification_expires,
         created_at = NOW(),
         resend_count = 1,
         resend_window_start = EXCLUDED.resend_window_start
       RETURNING id, user_id, old_email, new_email, verification_token`,
      [userId, oldEmail, newEmail, verificationToken, verificationExpires, new Date()]
    )

    if (results.rows.length === 0) {
      throw new Error("Unable to create pending email change.")
    }

    return results.rows[0]
  }
  catch (error) {
    console.error("Error creating pending email change:", error.message)
    throw new Error("DB error while creating pending email change.")
  }
}

// Verify email change and update user's email
const verifyEmailChange = async (verificationToken) => {
  try {
    await query('BEGIN')

    // Find pending email change by verification token
    const pendingResult = await query(
      `SELECT * FROM pending_email_changes 
       WHERE verification_token = $1 AND verification_expires > NOW()`,
      [verificationToken]
    )

    if (pendingResult.rows.length === 0) {
      await query('ROLLBACK')
      throw new Error("Invalid or expired email change verification token.")
    }

    const pendingChange = pendingResult.rows[0]

    // Update user email
    const userResults = await query(
      `UPDATE users SET email = $1 WHERE id = $2 
       RETURNING id, username, email`,
      [pendingChange.new_email, pendingChange.user_id]
    )

    if (userResults.rows.length === 0) {
      await query('ROLLBACK')
      throw new Error("User not found.")
    }

    // Update auth identity provider_user_id for local accounts
    await query(
      `UPDATE auth_identities SET provider_user_id = $1 
       WHERE user_id = $2 AND provider = 'local'`,
      [pendingChange.new_email, pendingChange.user_id]
    )

    // Remove the pending email change
    await query(
      `DELETE FROM pending_email_changes WHERE id = $1`,
      [pendingChange.id]
    )

    await query('COMMIT')
    return {
      user: userResults.rows[0],
      oldEmail: pendingChange.old_email,
      newEmail: pendingChange.new_email
    }
  }
  catch (error) {
    await query('ROLLBACK')
    console.error("Error verifying email change:", error.message)
    throw error
  }
}

// Get pending email change by user ID
const getPendingEmailChange = async (userId) => {
  try {
    const results = await query(
      `SELECT id, user_id, old_email, new_email, verification_token, verification_expires, created_at
       FROM pending_email_changes WHERE user_id = $1`,
      [userId]
    )
    return results.rows[0]
  }
  catch (error) {
    console.error("Error fetching pending email change:", error.message)
    throw new Error("DB error while fetching pending email change.")
  }
}

// Cancel pending email change
const cancelPendingEmailChange = async (userId) => {
  try {
    const results = await query(
      `DELETE FROM pending_email_changes WHERE user_id = $1 
       RETURNING id, old_email, new_email`,
      [userId]
    )

    return results.rows[0] // Will be undefined if no pending change found
  }
  catch (error) {
    console.error("Error canceling pending email change:", error.message)
    throw new Error("DB error while canceling pending email change.")
  }
}

// Clean up expired pending email changes (called by cron job)
const cleanupExpiredEmailChanges = async () => {
  try {
    const result = await query(
      `DELETE FROM pending_email_changes WHERE verification_expires < NOW() RETURNING id`
    )
    return result.rows.length
  }
  catch (error) {
    console.error("Error cleaning up expired email changes:", error.message)
    throw error
  }
}

export default {
  signUp,
  getUser,
  deleteUser,
  getUserByEmail,
  createGoogleUser,
  getUserByProvider,
  createOAuthUser,
  linkAuthProvider,
  getUserAuthMethods,
  removeAuthMethod,
  createStagingUser,
  verifyEmailAndCreateUser,
  getStagingUserByEmail,
  regenerateVerificationToken,
  cleanupExpiredStagingUsers,
  getUserByUsername,
  getUserById,
  getUserWithPassword,
  updateUsername,
  updateEmail,
  updatePassword,
  createPendingEmailChange,
  verifyEmailChange,
  getPendingEmailChange,
  cancelPendingEmailChange,
  cleanupExpiredEmailChanges
}
