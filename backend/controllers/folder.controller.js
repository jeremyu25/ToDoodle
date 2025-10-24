import FolderModel from "../models/folder.model.js"

const getFolder = async(req, res) => {
    try{
        const { id } = req.params; // Use path parameter
        if (!id) {
            return res.status(400).json({
                status: "fail",
                message: "Folder ID is required."
            })
        }
        const folder = await FolderModel.getFolderById(id)
        if (!folder) {
            return res.status(404).json({
                status: "fail",
                message: "User folder not found."
            })
        }
        return res.status(200).json({
            status: "success",
            data: folder
        })
    }
    catch(err){
        return res.status(500).json({
            status: "error",
            message: err.message
        })
    }
}

const getAllFolders = async(req, res) => {
    try{
        const user_id = req.user.id;
        
        const folders = await FolderModel.getAllFolders(user_id)
        if (folders.length === 0) {
            return res.status(200).json({
                status: "success",
                results_length: 0,
                data: {
                    folderdata: []
                },
                message: `No folders found for user ${user_id}`
            })
        }
        return res.status(200).json({
            status: "success",
            results_length: folders.length, 
            data: {
                folderdata: folders
            }
        })
    }
    catch(err){
        return res.status(500).json({
            status: "error",
            message: err.message
        })
    }
}

const createFolder = async(req, res) => {
    try{
        // Get user_id from authenticated token and data from body
        const user_id = req.user.id;
        const { name, description } = req.body;
        
        if (!name) {
            return res.status(400).json({
                status: "fail",
                message: "Folder name is required."
            })
        }
        
        const folder = await FolderModel.createFolder(user_id, name, description)
        return res.status(201).json({
            status: "success",
            data: folder
        })
    }
    catch(err){
        if (err.message && err.message.includes("Default folder already exists")) {
            return res.status(409).json({
                status: "fail",
                message: err.message
            })
        }

        return res.status(500).json({
            status: "error",
            message: err.message
        })
    }
}

const updateFolderName = async(req, res) => {
    try{
        const { id } = req.params; // Use path parameter
        const { name } = req.body; // Use request body
        
        if (!id || !name) {
            return res.status(400).json({
                status: "fail",
                message: "Folder ID and new folder name are required."
            })
        }
        
        const folder = await FolderModel.updateFolderName(id, name)
        if (!folder) {
            return res.status(404).json({
                status: "fail",
                message: "User folder not found."
            })
        }
        return res.status(200).json({
            status: "success",
            data: folder
        })
    }
    catch(err){
        if (err.message && err.message.includes("Cannot edit default folder")) {
            return res.status(403).json({
                status: "fail",
                message: err.message
            })
        }

        return res.status(500).json({
            status: "error",
            message: err.message
        })
    }
}

const updateFolderDescription = async(req, res) => {
    try{
        const { id } = req.params;
        const { description } = req.body;
        
        if (!id || description === undefined) {
            return res.status(400).json({
                status: "fail",
                message: "Folder ID and new folder description are required."
            })
        }
        
        const folder = await FolderModel.updateFolderDescription(id, description)
        if (!folder) {
            return res.status(404).json({
                status: "fail",
                message: "User folder not found."
            })
        }
        return res.status(200).json({
            status: "success",
            data: folder
        })
    }
    catch(err){
        if (err.message && err.message.includes("Cannot edit default folder")) {
            return res.status(403).json({
                status: "fail",
                message: err.message
            })
        }

        return res.status(500).json({
            status: "error",
            message: err.message
        })
    }
}

const deleteFolder = async(req, res) => {
    try{
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({
                status: "fail",
                message: "Folder ID is required."
            })
        }
        
        const folder = await FolderModel.deleteFolder(id)
        if (!folder) {
            return res.status(404).json({
                status: "fail",
                message: "User folder not found."
            })
        }
        return res.status(200).json({
            status: "success",
            data: folder
        })
    }
    catch(err){
        if (err.message && err.message.includes("Cannot delete default folder")) {
            return res.status(403).json({
                status: "fail",
                message: err.message
            })
        }

        return res.status(500).json({
            status: "error",
            message: err.message
        })
    }
}

const deleteAllFolders = async(req, res) => {
    try{
        const user_id = req.user.id;
        
        const folder = await FolderModel.deleteAllFolders(user_id)
        if (folder.length === 0) {
            return res.status(404).json({
                status: "fail",
                message: "User doesn't exist, or has no folders."
            })
        }
        return res.status(200).json({
            status: "success",
            results_length: folder.length,
            data: {
                folderdata: folder
            }
        })
    }
    catch(err){
        return res.status(500).json({
            status: "error",
            message: err.message
        })
    }
}
export default {
    getFolder,
    getAllFolders,
    createFolder,
    updateFolderName,
    updateFolderDescription,
    deleteFolder,
    deleteAllFolders
}