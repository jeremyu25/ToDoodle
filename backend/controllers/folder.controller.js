const FolderModel =  require('../models/folder.model.js')

const getFolder = async(req, res) => {
    try{
        const folder = await FolderModel.getFolderById(req.query.id)
        
        res.status(200).json({
        status: "success",
        results_length: folder.length,
        data: {
            folderdata: folder
        }
    })
    }
    catch(err){
        res.status(500).json({message: err.message})
    }
}

const getAllFolders = async(req, res) => {
    try{
        const folders = await FolderModel.getAllFolders(req.query.user_id)

        res.status(200).json({
        status: "success",
        results_length: folders,
        data: {
            folderdata: folders
        }
    })
    }
    catch(err){
        res.status(500).json({message: err.message})
    }
}

const createFolder = async(req, res) => {
    try{
        const folder = await FolderModel.createFolder(req.query.user_id, req.query.name, req.query.description)
        res.status(200).json({
            results_length: folder.length,
            data: {
                folderdata: folder
            }
        })
    }
    catch(err){
        res.status(500).json({message: err.message})
    }
}

const updateFolderName = async(req, res) => {
    try{
        const folder = await FolderModel.updateFolderName(req.query.id, req.query.name)
        if (!folder) {
            res.status(404).json({
                message: "User folder not found."
            })
        }
        res.status(200).json({
            results_length: folder.length,
            data: {
                folderdata: folder
            }
        })
    }
    catch(err){
        res.status(500).json({message:err.message})
    }
}

const updateFolderDescription = async(req, res) => {
    try{
        const folder = await FolderModel.updateFolderDescription(req.query.id, req.query.description)
        if (!folder) {
            res.status(404).json({
                message: "User folder not found."
            })
        }
        res.status(200).json({
            results_length: folder.length,
            data: {
                folderdata: folder
            }
        })
    }
    catch(err){
        res.status(500).json({message:err.message})
    }
}

const deleteFolder = async(req, res) => {
    try{
        const folder = await FolderModel.deleteFolder(req.query.id)
        if (!folder) {
            res.status(404).json({
                message: "User folder not found."
            })
        }
        res.status(200).json({
            results_length: folder.length,
            data: {
                folderdata: folder
            }
        })
    }
    catch(err){
        res.status(500).json({message: err.message})
    }
}

const deleteAllFolders = async(req, res) => {
    try{
        const folder = await FolderModel.deleteAllFolders(req.query.user_id)
        if (!folder) {
            res.status(404).json({
                message: "User has no folders."
            })
        }
        res.status(200).json({
            results_length: folder.length,
            data: {
                folderdata: folder
            }
        })
    }
    catch(err){
        res.status(500).json({message: err.message})
    }
}
module.exports = {
    getFolder,
    getAllFolders,
    createFolder,
    updateFolderName,
    updateFolderDescription,
    deleteFolder,
    deleteAllFolders
}