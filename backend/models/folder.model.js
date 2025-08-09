const db = require("../db/index.js")

const getFolderById = async(id) => {
    const results = await db.query(`select * from folders where id = $1`, [id])
    return results.rows
}

const getAllFolders = async(user_id) => {
    const results = await db.query(`select * from folders where user_id = $1`, [user_id])
    return results.rows
}

const createFolder = async (user_id, name) => {
  const res = await db.query(
    'INSERT INTO folders (user_id, name) VALUES ($1, $2) RETURNING *',
    [user_id, name]
  );
  return res.rows[0];
};

const updateFolder = async(id, name) => {
    const results = await db.query(`UPDATE folders SET name = $1 WHERE id = $2 RETURNING *`, [name, id])
    return results.rows
}

const deleteFolder = async(id) => {
    const results = await db.query(`DELETE FROM folders WHERE id = $1 RETURNING *`, [id])
    return results.rows
}


const deleteAllFolders = async(user_id) => {
    const results = await db.query(`DELETE FROM folders WHERE user_id = $1 RETURNING *`, [user_id])
    return results.rows
}
module.exports = {
    getFolderById,
    getAllFolders,
    createFolder,
    updateFolder,
    deleteFolder,
    deleteAllFolders
}