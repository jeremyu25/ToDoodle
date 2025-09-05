import FolderModel from "../models/folder.model.js"

const getFolder = async(req, res) => {
    try{
        if (!req.query.id) {
            return res.status(400).json({
                status: "fail",
                message: "Folder ID is required."
            })
        }
        const folder = await FolderModel.getFolderById(req.query.id)
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
        return res.status(500).json({message: err.message})
    }
}

const getAllFolders = async(req, res) => {
    try{
        if (!req.query.user_id) {
            return res.status(400).json({
                status: "fail",
                message: "User ID is required."
            })
        }
        const folders = await FolderModel.getAllFolders(req.query.user_id)
        if (folders.length === 0) {
            return res.status(200).json({
                status: "success",
                results_length: 0,
                data: {
                    folderdata: []
                },
                message: `No folders found for user ${req.query.user_id}`
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
        return res.status(500).json({message: err.message})
    }
}

const createFolder = async(req, res) => {
    try{
        if (!req.query.user_id || !req.query.name) {
            return res.status(400).json({
                status: "fail",
                message: "User ID and folder name are required."
            })
        }
        const folder = await FolderModel.createFolder(req.query.user_id, req.query.name, req.query.description)
        return res.status(201).json({
            status: "success",
            data: folder
        })
    }
    catch(err){
        return res.status(500).json({message: err.message})
    }
}

const updateFolderName = async(req, res) => {
    try{
        if (!req.query.id || !req.query.name) {
            return res.status(400).json({
                status: "fail",
                message: "Folder ID and new folder name are required."
            })
        }
        const folder = await FolderModel.updateFolderName(req.query.id, req.query.name)
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
        return res.status(500).json({message:err.message})
    }
}

const updateFolderDescription = async(req, res) => {
    try{
        if (!req.query.id || !req.query.description) {
            return res.status(400).json({
                message: "Folder ID and new folder description are required."
            })
        }
        const folder = await FolderModel.updateFolderDescription(req.query.id, req.query.description)
        if (!folder) {
            return res.status(404).json({
                message: "User folder not found."
            })
        }
        return res.status(200).json({
            status: "success",
            data: folder
        })
    }
    catch(err){
        return res.status(500).json({message:err.message})
    }
}

const deleteFolder = async(req, res) => {
    try{
        const folder = await FolderModel.deleteFolder(req.query.id)
        if (!folder) {
            return res.status(404).json({
                message: "User folder not found."
            })
        }
        return res.status(200).json({
            data: folder
        })
    }
    catch(err){
        return res.status(500).json({message: err.message})
    }
}

const deleteAllFolders = async(req, res) => {
    try{
        const folder = await FolderModel.deleteAllFolders(req.query.user_id)
        if (folder.length === 0) {
            return res.status(404).json({
                message: "User doesn't exist, or has no folders."
            })
        }
        return res.status(200).json({
            results_length: folder.length,
            data: {
                folderdata: folder
            }
        })
    }
    catch(err){
        return res.status(500).json({message: err.message})
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