import FolderModel from "../models/folder.model.js"

const isValidHexColor = (value) => {
    if (value === null || value === undefined || value === '') return true
    return /^#([0-9A-Fa-f]{6})$/.test(value)
}

const getFolder = async (req, res) => {
    try {
        const { id } = req.params
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

const getAllFolders = async (req, res) => {
    try {
        const user_id = req.user.id
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
    catch (err) {
        return res.status(500).json({
            status: "error",
            message: err.message
        })
    }
}

const createFolder = async (req, res) => {
    try {
        const user_id = req.user.id
        const { name, description, color } = req.body

        if (!name) {
            return res.status(400).json({
                status: "fail",
                message: "Folder name is required."
            })
        }
        if (!isValidHexColor(color)) {
            return res.status(400).json({
                status: "fail",
                message: "Color must be a hex string like '#RRGGBB'."
            })
        }

        const folder = await FolderModel.createFolder(user_id, name, description, false, color)
        return res.status(201).json({
            status: "success",
            data: folder
        })
    }
    catch (err) {
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

const updateFolderName = async (req, res) => {
    try {
        const { id } = req.params
        const { name } = req.body
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
    catch (err) {
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

const updateFolderDescription = async (req, res) => {
    try {
        const { id } = req.params
        const { description } = req.body
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
    } catch (err) {
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

const updateFolderColor = async (req, res) => {
    try {
        const { id } = req.params
        const { color } = req.body
        if (!id || color === undefined) {
            return res.status(400).json({
                status: "fail",
                message:"Folder ID and new color are required."
            })
        }
        if (!isValidHexColor(color)) {
            return res.status(400).json({
                status: "fail",
                message: "Color must be a hex string like '#RRGGBB'."
            })
        }
        const updated = await FolderModel.updateFolderColor(id, color)
        if (!updated) {
            return res.status(404).json({
                status: "fail",
                message: "User folder not found."
            })
        }
        return res.status(200).json({
            status: "success",
            data: updated
        })
    } 
    catch (err) {
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

const deleteFolder = async (req, res) => {
    try {
        const { id } = req.params
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
    catch (err) {
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

const deleteAllFolders = async (req, res) => {
    try {
        const user_id = req.user.id
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
    catch (err) {
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
    updateFolderColor,
    deleteFolder,
    deleteAllFolders
}