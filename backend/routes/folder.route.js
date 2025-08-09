const express = require("express")

const router = express.Router()

const folderController = require('../controllers/folder.controller.js')

router.get('/', folderController.getFolder)

router.get('/all', folderController.getAllFolders)

router.post('/', folderController.createFolder)

router.put('/', folderController.updateFolder)

router.delete('/', folderController.deleteFolder)

router.delete('/all', folderController.deleteAllFolders)

module.exports = router