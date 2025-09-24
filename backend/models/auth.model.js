import query from "../db/index.js"

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
  getUserAuthMethods
}
