const db = require("../db/index.js")

const getFolderById = async(id) => {
    try {
            const results = await db.query(`select * from folders where id = $1`, [id])
        
            if (results.rows.length === 0){
                throw new Error("Folder not found.")
        }
        return results.rows
        } catch(error){
            console.error("Error in getting the folder of from database:", error.message)
            throw new Error("DB error while getting folder.")
        }
}

const getAllFolders = async(user_id) => {
    try {
           const results = await db.query(`select * from folders where user_id = $1`, [user_id])
        
            if (results.rows.length === 0){
                throw new Error("Folder not found or user has no folders.")
        }
        return results.rows
        } catch(error){
            console.error("Error in getting all folders of a user from database:", error.message)
            throw new Error("DB error while getting folders from user.")
        }
}

const createFolder = async (user_id, name, description) => {
  
    try {
            const res = await db.query(
        'INSERT INTO folders (user_id, name, description) VALUES ($1, $2, $3) RETURNING *',
        [user_id, name, description]
    );
    
          if (results.rows.length === 0){
              throw new Error("Unable to create new folder in DB.")
      }
      return results.rows[0];
      } catch(error){
          console.error("Error in creating folder in database:", error.message)
          throw new Error("DB error while creating folder.")
      }
};

const updateFolderName = async(id, name) => {
    
    try {
            const results = await db.query(`UPDATE folders SET name = $1 WHERE id = $2 RETURNING *`, [name, id])
    
            if (results.rows.length === 0){
                throw new Error("Folder not found.")
        }
        return results.rows
        } catch(error){
            console.error("Error in updating folder from database:", error.message)
            throw new Error("DB error while updating folder ID name.")
        }
}

const updateFolderDescription = async(id, description) => {
    
    try {
            const results = await db.query(`UPDATE folders SET description = $1 WHERE id = $2 RETURNING *`, [description, id])
    
            if (results.rows.length === 0){
                throw new Error("Folder not found.")
        }
        return results.rows
        } catch(error){
            console.error("Error in updating folder from database:", error.message)
            throw new Error("DB error while updating folder ID description.")
        }
}

const deleteFolder = async(id) => {
    
    try {
            const results = await db.query(`DELETE FROM folders WHERE id = $1 RETURNING *`, [id])
        
            if (results.rows.length === 0){
                throw new Error("Folder not found.")
        }
        return results.rows
        } catch(error){
            console.error("Error in deleting folder from database:", error.message)
            throw new Error("DB error while deleting folder.")
        }
}


const deleteAllFolders = async(user_id) => {
    try {
            const results = await db.query(`DELETE FROM folders WHERE user_id = $1 RETURNING *`, [user_id])
    
            if (results.rows.length === 0){
                throw new Error("User ID not found, nothing deleted.")
        }
        return results.rows
        } catch(error){
            console.error("Error in deleting all folders of a user from database:", error.message)
            throw new Error("DB error while deleting folders.")
        }
}
module.exports = {
    getFolderById,
    getAllFolders,
    createFolder,
    updateFolderName,
    updateFolderDescription,
    deleteFolder,
    deleteAllFolders
}