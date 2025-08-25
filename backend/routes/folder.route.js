import express from "express"
import folderController from "../controllers/folder.controller.js"

const router = express.Router()

router.get("/", folderController.getFolder)
router.get("/all", folderController.getAllFolders)
router.post("/", folderController.createFolder)
router.patch("/name", folderController.updateFolderName)
router.patch("/description", folderController.updateFolderDescription)
router.delete("/", folderController.deleteFolder)
router.delete("/all", folderController.deleteAllFolders)

export default router
