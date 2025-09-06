import query from "../db/index.js"

const getNoteById = async (id) => {
    try {
        const results = await query(`select * from notes where id = $1`, [id])
        return results.rows[0]
    } catch (error) {
        console.error("Error in getting note ID from database:", error.message)
        throw new Error("DB error while getting note ID.")
    }
}

const getAllNotes = async (user_id) => {
    try {
        const results = await query(`select * from notes where user_id = $1`, [user_id])
        return results.rows
    } catch (error) {
        console.error("Error in getting note ID from database:", error.message)
        throw new Error("DB error while getting note ID.")
    }
}

const createNote = async (user_id, folder_id, title, content, status) => {
    try {
        const results = await query(
            `INSERT INTO notes(user_id, folder_id, title, content, status) VALUES($1, $2, $3, $4, $5) RETURNING *`,
            [user_id, folder_id, title, content, status]
        )
        return results.rows[0];
    } catch (error) {
        console.error("Error in creating note in database:", error.message)
        throw new Error("DB error while creating note.")
    }
};

const updateNoteContent = async (id, content) => {
    try {
        const results = await query(`UPDATE notes SET content = $1 WHERE id = $2 RETURNING *`, [content, id])
        return results.rows[0]
    } catch (error) {
        console.error("Error in updating note from database:", error.message)
        throw new Error("DB error while updating note ID content.")
    }

}

const updateNoteTitle = async (id, title) => {
    try {
        const results = await query(`UPDATE notes SET title = $1 WHERE id = $2 RETURNING *`, [title, id])
        return results.rows[0]
    } catch (error) {
        console.error("Error in updating note from database:", error.message)
        throw new Error("DB error while updating note ID title.")
    }
}

const updateNoteStatus = async (id, status) => {
    try {
        const results = await query(`UPDATE notes SET status = $1 WHERE id = $2 RETURNING *`, [status, id])
        return results.rows[0]
    } catch (error) {
        console.error("Error in updating note from database:", error.message)
        throw new Error("DB error while updating note ID status.")
    }
}

const deleteNote = async (id) => {
    try {
        const results = await query(`DELETE FROM notes WHERE id = $1 RETURNING *`, [id])
        return results.rows[0]
    } catch (error) {
        console.error("Error in deleting note from database:", error.message)
        throw new Error("DB error while deleting note.")
    }
}


const deleteAllNotes = async (user_id) => {
    try {
        const results = await query(`DELETE FROM notes WHERE user_id = $1 RETURNING *`, [user_id])
        return results.rows
    } catch (error) {
        console.error("Error in deleting all notes of a user from database:", error.message)
        throw new Error("DB error while deleting note.")
    }
}


export default {
    getNoteById,
    getAllNotes,
    createNote,
    updateNoteContent,
    updateNoteTitle,
    updateNoteStatus,
    deleteAllNotes,
    deleteNote
}