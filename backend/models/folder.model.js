import query from "../db/index.js"

const getFolderById = async (id) => {
    try {
        const results = await query(`select * from folders where id = $1`, [id])
        return results.rows[0]
    }
    catch (error) {
        console.error("Error in getting the folder of from database:", error.message)
        throw new Error("DB error while getting folder.")
    }
}

const getAllFolders = async (user_id) => {
    try {
        const results = await query(`select * from folders where user_id = $1`, [user_id])
        return results.rows
    } 
    catch (error) {
        console.error("Error in getting all folders of a user from database:", error.message)
        throw new Error("DB error while getting folders from user.")
    }
}

const createFolder = async (user_id, name, description, is_default = false, color = null) => {

    try {
        const normalized = (name || '').toString().trim().toLowerCase()

        // If attempting to create a default folder, ensure one doesn't already exist
        if (is_default || normalized === 'default') {
            // Check by is_default flag first
            const existingDefault = await query(`SELECT id FROM folders WHERE user_id = $1 AND is_default = true LIMIT 1`, [user_id])
            if (existingDefault.rows.length > 0) {
                throw new Error("Default folder already exists.")
            }
            // Also check by name collision (case-insensitive)
            const existingByName = await query(`SELECT id FROM folders WHERE user_id = $1 AND LOWER(TRIM(name)) = $2 LIMIT 1`, [user_id, 'default'])
            if (existingByName.rows.length > 0) {
                throw new Error("Default folder already exists.")
            }
        }
        const results = await query(
            `INSERT INTO folders (user_id, name, description, is_default, color) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [user_id, name, description, is_default, color]
        )
        return results.rows[0]
    } 
    catch (error) {
        console.error("Error in creating folder in database:", error.message)
        throw new Error("DB error while creating folder.")
    }
}

const updateFolderName = async (id, name) => {

    try {
        // Prevent renaming default folder
        const folder = await getFolderById(id)
        if (!folder) {
            throw new Error("Folder not found.")
        }
        if (folder.is_default) {
            throw new Error("Cannot edit default folder.")
        }

        const results = await query(`UPDATE folders SET name = $1 WHERE id = $2 RETURNING *`, [name, id])

        if (results.rows.length === 0) {
            throw new Error("Folder not found.")
        }
        return results.rows
    }
    catch (error) {
        console.error("Error in updating folder from database:", error.message)
        throw new Error("DB error while updating folder ID name.")
    }
}

const updateFolderDescription = async (id, description) => {

    try {
        // Prevent editing description of default folder
        const folder = await getFolderById(id)
        if (!folder) {
            throw new Error("Folder not found.")
        }
        if (folder.is_default) {
            throw new Error("Cannot edit default folder.")
        }

        const results = await query(`UPDATE folders SET description = $1 WHERE id = $2 RETURNING *`, [description, id])

        if (results.rows.length === 0) {
            throw new Error("Folder not found.")
        }
        return results.rows
    }
    catch (error) {
        console.error("Error in updating folder from database:", error.message)
        throw new Error("DB error while updating folder ID description.")
    }
}

const updateFolderColor = async (id, color) => {
    try {
        // Prevent editing color of default folder
        const folder = await getFolderById(id)
        if (!folder) {
            throw new Error("Folder not found.")
        }
        if (folder.is_default) {
            throw new Error("Cannot edit default folder.")
        }

        const results = await query(`UPDATE folders SET color = $1 WHERE id = $2 RETURNING *`, [color, id])

        if (results.rows.length === 0) {
            throw new Error("Folder not found.")
        }
        return results.rows
    }
    catch (error) {
        console.error("Error in updating folder color from database:", error.message)
        throw new Error("DB error while updating folder color.")
    }
}

const deleteFolder = async (id) => {

    try {
        // Prevent deleting the default folder
        const folder = await getFolderById(id)
        if (!folder) {
            throw new Error("Folder not found.")
        }
        if (folder.is_default) {
            throw new Error("Cannot delete default folder.")
        }

        const results = await query(`DELETE FROM folders WHERE id = $1 RETURNING *`, [id])
        return results.rows[0]
    }
    catch (error) {
        console.error("Error in deleting folder from database:", error.message)
        throw new Error("DB error while deleting folder.")
    }
}


const deleteAllFolders = async (user_id) => {
    try {
        // Do not delete the default folder for the user
        const results = await query(`DELETE FROM folders WHERE user_id = $1 AND (is_default IS NULL OR is_default = false) RETURNING *`, [user_id])
        return results.rows
    }
    catch (error) {
        console.error("Error in deleting all folders of a user from database:", error.message)
        throw new Error("DB error while deleting folders.")
    }
}
export default {
    getFolderById,
    getAllFolders,
    createFolder,
    updateFolderName,
    updateFolderDescription,
    updateFolderColor,
    deleteFolder,
    deleteAllFolders
}