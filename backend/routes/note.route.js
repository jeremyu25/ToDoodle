import express from "express"
import noteController from "../controllers/note.controller.js"
import { verifyToken } from "../utils/verify.js"

const router = express.Router()

// Apply authentication middleware to all note routes
router.use(verifyToken)

router.get("/:id", noteController.getNote)
router.get("/", noteController.getAllNotes)
router.post("/", noteController.createNote)
router.patch("/:id/content", noteController.updateNoteContent)
router.patch("/:id/title", noteController.updateNoteTitle)
router.patch("/:id/status", noteController.updateNoteStatus)
router.delete("/:id", noteController.deleteNote)
router.delete("/", noteController.deleteAllNotes)

export default router
