const db = require("../db/index.js");

const signUp = async (username, passwordhash) => {
  try {
    const results = await db.query(
      `INSERT INTO users(username, password_hash) 
       VALUES($1, $2) RETURNING id, username`,
      [username, passwordhash]
    );

    if (results.rows.length === 0) {
      throw new Error("Unable to create user.");
    }

    return results.rows[0];
  } catch (error) {
    console.error("Error signing up user in database:", error.message);
    throw new Error("DB error while creating user.");
  }
};

const getUser = async (username) => {
  try {
    const results = await db.query(
      `SELECT id, username, password_hash 
       FROM users WHERE username = $1`,
      [username]
    );

    if (results.rows.length === 0) {
      throw new Error("User not found.");
    }

    return results.rows[0];
  } catch (error) {
    console.error("Error fetching user from database:", error.message);
    throw new Error("DB error while fetching user.");
  }
};

const deleteUser = async (id) => {
  try {
    const results = await db.query(
      `DELETE FROM users WHERE id = $1 RETURNING id, username`,
      [id]
    );

    if (results.rows.length === 0) {
      throw new Error("User not found.");
    }

    return results.rows[0];
  } catch (error) {
    console.error("Error deleting user from database:", error.message);
    throw new Error("DB error while deleting user.");
  }
};

module.exports = { signUp, getUser, deleteUser };
