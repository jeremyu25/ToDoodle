import express from "express"
import folderController from "../controllers/folder.controller.js"
import { verifyToken } from "../utils/verify.js"

const router = express.Router()

// Apply authentication middleware to all folder routes
router.use(verifyToken)

router.get("/:id", folderController.getFolder)
router.get("/", folderController.getAllFolders)
router.post("/", folderController.createFolder)
router.patch("/:id/name", folderController.updateFolderName)
router.patch("/:id/description", folderController.updateFolderDescription)
router.delete("/:id", folderController.deleteFolder)
router.delete("/", folderController.deleteAllFolders)

export default router
