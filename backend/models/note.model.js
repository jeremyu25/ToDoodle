const db = require("../db/index.js")

const getNoteById = async(id) => {
    const results = await db.query(`select * from notes where id = $1`, [id])
    return results.rows
}

const getAllNotes = async(user_id) => {
    const results = await db.query(`select * from notes where user_id = $1`, [user_id])
    return results.rows
}

const createNote = async (user_id, folder_id, title, content) => {
  const res = await db.query(
    'INSERT INTO notes(user_id, folder_id, title, content) VALUES($1, $2, $3, $4) RETURNING *',
    [user_id,folder_id, title, content]
  );
  return res.rows[0];
};

const updateNoteContent = async(id, content) => {
    const results = await db.query(`UPDATE notes SET content = $1 WHERE id = $2 RETURNING *`, [content, id])
    return results.rows
}

const updateNoteTitle = async(id, title) => {
    const results = await db.query(`UPDATE notes SET title = $1 WHERE id = $2 RETURNING *`, [title, id])
    return results.rows
}

const deleteNote = async(id) => {
    const results = await db.query(`DELETE FROM notes WHERE id = $1 RETURNING *`, [id])
    return results.rows
}


const deleteAllNotes = async(user_id) => {
    const results = await db.query(`DELETE FROM notes WHERE user_id = $1 RETURNING *`, [user_id])
    return results.rows
}


module.exports = {
    getNoteById,
    getAllNotes,
    createNote,
    updateNoteContent,
    updateNoteTitle,
    deleteAllNotes,
    deleteNote
}