import query from "../db/index.js"

const signUp = async (username, passwordhash, email) => {
  try {
    const results = await query(
      `INSERT INTO users(username, password_hash, email) 
       VALUES($1, $2, $3) RETURNING id, username, email`,
      [username, passwordhash, email]
    )

    if (results.rows.length === 0) {
      throw new Error("Unable to create user.")
    }

    return results.rows[0]
  } catch (error) {
    throw error

}
}

const getUser = async (identifier) => {
  try {
    const results = await query(
      `SELECT id, username, email, password_hash 
       FROM users WHERE username = $1 OR email = $1`,
      [identifier]
    )

    return results.rows[0]
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

export default {
  signUp,
  getUser,
  deleteUser
}
