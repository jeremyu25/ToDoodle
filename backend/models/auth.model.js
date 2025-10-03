import query from "../db/index.js"
import crypto from "crypto"
import { createOAuthUsername } from "../utils/usernameUtils.js"

const TIMEOUT_DURATION = 9 * 60 * 1000 // 9 mins

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
  } catch (error) {
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
      `INSERT INTO auth_identities(user_id, provider, provider_user_id, password_hash) 
       VALUES($1, 'local', $2, $3)`,
      [user.id, stagingUser.email, stagingUser.password_hash]
    )

    // Remove from staging users
    await query(
      `DELETE FROM staging_users WHERE id = $1`,
      [stagingUser.id]
    )

    await query('COMMIT')
    return user
  } catch (error) {
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
  } catch (error) {
    console.error("Error fetching staging user by email:", error.message)
    throw new Error("DB error while fetching staging user.")
  }
}

// Resend verification email (generate new token)
const regenerateVerificationToken = async (email) => {
  try {
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationExpires = new Date(Date.now() + TIMEOUT_DURATION)

    const result = await query(
      `UPDATE staging_users 
       SET verification_token = $1, verification_expires = $2 
       WHERE email = $3 
       RETURNING id, username, email, verification_token`,
      [verificationToken, verificationExpires, email]
    )

    if (result.rows.length === 0) {
      throw new Error("Staging user not found.")
    }

    return result.rows[0]
  } catch (error) {
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
  } catch (error) {
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
      `INSERT INTO auth_identities(user_id, provider, provider_user_id, password_hash) 
       VALUES($1, 'local', $2, $3)`,
      [user.id, email, passwordhash]
    )

    await query('COMMIT')
    return user
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
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
      `INSERT INTO auth_identities(user_id, provider, provider_user_id) 
       VALUES($1, 'google', $2)`,
      [user.id, googleId]
    )

    await query('COMMIT')
    return user
  } catch (error) {
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
  } catch (error) {
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
      `INSERT INTO auth_identities(user_id, provider, provider_user_id) 
       VALUES($1, $2, $3)`,
      [user.id, provider, providerUserId]
    )

    await query('COMMIT')
    return user
  } catch (error) {
    await query('ROLLBACK')
    console.error("Error creating OAuth user:", error.message)
    throw error
  }
}

// Function to link new auth provider to existing user
const linkAuthProvider = async (userId, provider, providerUserId, passwordHash = null) => {
  try {
    const results = await query(
      `INSERT INTO auth_identities(user_id, provider, provider_user_id, password_hash) 
       VALUES($1, $2, $3, $4) RETURNING id`,
      [userId, provider, providerUserId, passwordHash]
    )

    if (results.rows.length === 0) {
      throw new Error("Unable to link auth provider.")
    }

    return results.rows[0]
  } catch (error) {
    console.error("Error linking auth provider:", error.message)
    throw error
  }
}

// Function to get all auth methods for a user
const getUserAuthMethods = async (userId) => {
  try {
    const results = await query(
      `SELECT provider, provider_user_id 
       FROM auth_identities 
       WHERE user_id = $1`,
      [userId]
    )
    return results.rows
  } catch (error) {
    console.error("Error fetching user auth methods:", error.message)
    throw new Error("DB error while fetching user auth methods.")
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
  createStagingUser,
  verifyEmailAndCreateUser,
  getStagingUserByEmail,
  regenerateVerificationToken,
  cleanupExpiredStagingUsers
}
