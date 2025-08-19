const db = require("../db/index.js")

const getNoteById = async(id) => {
    try {
        const results = await db.query(`select * from notes where id = $1`, [id])
        if (results.rows.length === 0){
            throw new Error("Note not found.")
    }
    return results.rows
    } catch(error){
        console.error("Error in getting note ID from database:", error.message)
        throw new Error("DB error while getting note ID.")
    }
}

const getAllNotes = async(user_id) => {
    try {
        const results = await db.query(`select * from notes where user_id = $1`, [user_id])
        if (results.rows.length === 0){
            throw new Error("Note not found or user has no notes.")
    }
    return results.rows
    } catch(error){
        console.error("Error in getting note ID from database:", error.message)
        throw new Error("DB error while getting note ID.")
    }
}

const createNote = async (user_id, folder_id, title, content) => {
  try {
        const results = await db.query(
    'INSERT INTO notes(user_id, folder_id, title, content) VALUES($1, $2, $3, $4) RETURNING *',
    [user_id,folder_id, title, content]
  );
        if (results.rows.length === 0){
            throw new Error("Unable to create new note in DB.")
    }
    return results.rows[0];
    } catch(error){
        console.error("Error in creating note in database:", error.message)
        throw new Error("DB error while creating note.")
    }
};

const updateNoteContent = async(id, content) => {
    try {
        const results = await db.query(`UPDATE notes SET content = $1 WHERE id = $2 RETURNING *`, [content, id])
        if (results.rows.length === 0){
            throw new Error("Note not found.")
    }
    return results.rows
    } catch(error){
        console.error("Error in updating note from database:", error.message)
        throw new Error("DB error while updating note ID content.")
    }
    
}

const updateNoteTitle = async(id, title) => {
    try {
        const results = await db.query(`UPDATE notes SET title = $1 WHERE id = $2 RETURNING *`, [title, id])
    
        if (results.rows.length === 0){
            throw new Error("Note not found.")
    }
    return results.rows
    } catch(error){
        console.error("Error in updating note from database:", error.message)
        throw new Error("DB error while updating note ID title.")
    }
}

const updateNoteStatus = async(id, status) => {
    try {
        const results = await db.query(`UPDATE notes SET status = $1 WHERE id = $2 RETURNING *`, [status, id])
    
        if (results.rows.length === 0){
            throw new Error("Note not found.")
    }
    return results.rows
    } catch(error){
        console.error("Error in updating note from database:", error.message)
        throw new Error("DB error while updating note ID status.")
    }
}

const deleteNote = async(id) => {
    try {
        const results = await db.query(`DELETE FROM notes WHERE id = $1 RETURNING *`, [id])
    
        if (results.rows.length === 0){
            throw new Error("Note not found.")
    }
    return results.rows
    } catch(error){
        console.error("Error in deleting note from database:", error.message)
        throw new Error("DB error while deleting note.")
    }
}


const deleteAllNotes = async(user_id) => {
    try {
        const results = await db.query(`DELETE FROM notes WHERE user_id = $1 RETURNING *`, [user_id])
    
        if (results.rows.length === 0){
            throw new Error("User ID not found, nothing deleted.")
    }
    return results.rows
    } catch(error){
        console.error("Error in deleting all notes of a user from database:", error.message)
        throw new Error("DB error while deleting note.")
    }
}


module.exports = {
    getNoteById,
    getAllNotes,
    createNote,
    updateNoteContent,
    updateNoteTitle,
    updateNoteStatus,
    deleteAllNotes,
    deleteNote
}