const express = require("express")

const router = express.Router()

const folderController = require('../controllers/folder.controller.js')

router.get('/', folderController.getFolder)

router.get('/all', folderController.getAllFolders)

router.post('/', folderController.createFolder)

router.patch('/name', folderController.updateFolderName)

router.patch('/description', folderController.updateFolderDescription)

router.delete('/', folderController.deleteFolder)

router.delete('/all', folderController.deleteAllFolders)

module.exports = router