const express = require("express")

const router = express.Router()

const noteController =  require('../controllers/note.controller.js')

router.get('/', noteController.getNote)

router.get('/all', noteController.getAllNotes)

router.post('/', noteController.createNote)

router.put('/content', noteController.updateNoteContent)

router.put('/title', noteController.updateNoteTitle)

router.put('/status', noteController.updateNoteStatus)

router.delete('/', noteController.deleteNote)

router.delete('/all', noteController.deleteAllNotes)

module.exports = router