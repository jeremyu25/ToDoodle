const express = require("express")
const noteController =  require("../controllers/note.controller.js")

const router = express.Router()

router.get("/", noteController.getNote)
router.get("/all", noteController.getAllNotes)
router.post("/", noteController.createNote)
router.patch("/content", noteController.updateNoteContent)
router.patch("/title", noteController.updateNoteTitle)
router.patch("/status", noteController.updateNoteStatus)
router.delete("/", noteController.deleteNote)
router.delete("/all", noteController.deleteAllNotes)

module.exports = router