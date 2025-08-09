const db = require("../db/index.js")

const signUp = async(username, passwordhash) => {
    const results = await db.query(`INSERT INTO users(username, password_hash) VALUES($1, $2) RETURNING *`, [username, passwordhash])
    return results.rows
}

const getUser = async(username) => {
    const validUser = await db.query(`select id, username, password_hash from users where username = $1`, [username])
    return validUser.rows
}

const deleteUser = async(id) => {
    const deletedUser =await db.query(`DELETE FROM users where id = $1 RETURNING *`, [id])
    return deletedUser.rows
}

module.exports = { signUp, getUser, deleteUser }