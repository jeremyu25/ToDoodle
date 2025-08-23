const NoteModel = require('../models/note.model.js')

const getNote = async(req, res) => {
    try{
        const note = await NoteModel.getNoteById(req.query.id)
        
        console.log(note)
        res.status(200).json({
        status: "success",
        results_length: note.length,
        data: {
            notedata: note
        }
    })
    }
    catch(err){
        res.status(500).json({message: err.message})
    }
}

const getAllNotes = async(req, res) => {
    try{
        const notes = await NoteModel.getAllNotes(req.query.user_id)
        console.log(notes)
        res.status(200).json({
        status: "success",
        results_length: notes.length,
        data: {
            notedata: notes
        }
    })
    }
    catch(err){
        res.status(500).json({message: err.message})
    }
}

 const createNote = async(req, res) => {
    try{
        const { user_id, folder_id, title, content, status } = req.query
        const allowedStatuses = ['not_started', 'in_progress', 'completed']
        const safeStatus = allowedStatuses.includes(status) ? status : 'not_started'
        const note = await NoteModel.createNote(user_id, folder_id, title, content, safeStatus)
        res.status(200).json({
            results_length: note.length,
            data: {
                notedata: note
            }
        })
    }
    catch(err){
        res.status(500).json({message: err.message})
    }
}

 const updateNoteContent = async(req, res) => {
    try{
        const note = await NoteModel.updateNoteContent(req.query.id, req.query.content)
        if (!note) {
            res.status(404).json({
                message: "User note not found."
            })
        }
        res.status(200).json({
            results_length: note.length,
            data: {
                notedata: note
            }
        })
    }
    catch(err){
        res.status(500).json({message:err.message})
    }
}
const updateNoteTitle = async(req, res) => {
    try{
        const note = await NoteModel.updateNoteTitle(req.query.id, req.query.title)
        if (!note) {
            res.status(404).json({
                message: "User note not found."
            })
        }
        res.status(200).json({
            results_length: note.length,
            data: {
                notedata: note
            }
        })
    }
    catch(err){
        res.status(500).json({message:err.message})
    }
}
 const deleteNote = async(req, res) => {
    try{
        const note = await NoteModel.deleteNote(req.query.id)
        if (!note) {
            res.status(404).json({
                message: "User note not found."
            })
        }
        res.status(200).json({
            results_length: note.length,
            data: {
                notedata: note
            }
        })
    }
    catch(err){
        res.status(500).json({message: err.message})
    }
}

const updateNoteStatus = async(req, res) => {
    try{
        const { id, status } = req.query
        const allowedStatuses = ['not_started', 'in_progress', 'completed']
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' })
        }
        const note = await NoteModel.updateNoteStatus(id, status)
        if (!note) {
            res.status(404).json({
                message: "User note not found."
            })
        }
        res.status(200).json({
            results_length: note.length,
            data: {
                notedata: note
            }
        })
    }
    catch(err){
        console.log({message:err.message})
        res.status(500).json({message:err.message})
    }
}

 const deleteAllNotes = async(req, res) => {
    try{
        const note = await NoteModel.deleteAllNotes(req.query.user_id)
        if (!note) {
            res.status(404).json({
                message: "User has no notes."
            })
        }
        res.status(200).json({
            results_length: note.length,
            data: {
                notedata: note
            }
        })
    }
    catch(err){
        res.status(500).json({message: err.message})
    }
}

module.exports = {
    getNote,
    getAllNotes,
    createNote,
    updateNoteContent,
    updateNoteTitle,
    updateNoteStatus,
    deleteAllNotes,
    deleteNote
}