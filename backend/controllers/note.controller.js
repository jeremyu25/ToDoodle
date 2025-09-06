import NoteModel from "../models/note.model.js" 

const getNote = async (req, res) => {
  try {
    const { id } = req.query
    if (!id) {
      return res.status(400).json({
        status: "fail",
        message: "Note ID query param is required",
      })
    }
    const note = await NoteModel.getNoteById(id)
    if (!note) {
      return res.status(404).json({
        status: "fail",
        message: `Note with id ${id} not found`,
      })
    }
    return res.status(200).json({
      status: "success",
      data: note,
    })
  } catch (err) {
    console.error(err) 
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    })
  }
}

const getAllNotes = async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) {
      return res.status(400).json({
        status: "fail",
        message: "User ID is required",
      });
    }
    const notes = await NoteModel.getAllNotes(user_id);
    if (notes.length === 0) {
      return res.status(200).json({
        status: "success",
        results_length: 0,
        data: {
          notedata: [],
        },
        message: `No notes found for user ${user_id}`,
      });
    }
    res.status(200).json({
      status: "success",
      results_length: notes.length,
      data: {
        notedata: notes,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};


 const createNote = async(req, res) => {
    try{
        const { user_id, folder_id, title, content, status } = req.query
        if (!user_id || !folder_id || !title) {
            return res.status(400).json({
                status: "fail",
                message: "user_id, folder_id, and title are required",
            })
            }
        const allowedStatuses = ["not_started", "in_progress", "completed"]
        const safeStatus = allowedStatuses.includes(status) ? status : "not_started"
        const note = await NoteModel.createNote(user_id, folder_id, title, content, safeStatus)
        return res.status(201).json({
            data: note
        })
    } catch(err){
        return res.status(500).json({message: err.message})
    }
}

 const updateNoteContent = async(req, res) => {
    try{
        if (!req.query.id || !req.query.content) {
            return res.status(400).json({
                message: "Note ID and content are required."
            })
        }
        const note = await NoteModel.updateNoteContent(req.query.id, req.query.content)
        if (!note) {
            return res.status(404).json({
                message: "User note not found."
            })
        }
        return res.status(200).json({
            data: note
        })
    } catch(err){
        return res.status(500).json({message:err.message})
    }
}
const updateNoteTitle = async(req, res) => {
    try{
                if (!req.query.id || !req.query.title) {
            return res.status(400).json({
                message: "Note ID and content are required."
            })
        }
        const note = await NoteModel.updateNoteTitle(req.query.id, req.query.title)
        if (!note) {
            return res.status(404).json({
                message: "User note not found."
            })
        }
        return res.status(200).json({
            data: note
        })
    } catch(err){
        return res.status(500).json({message:err.message})
    }
}

const updateNoteStatus = async(req, res) => {
    try{

        const allowedStatuses = ["not_started", "in_progress", "completed"]

        if (!allowedStatuses.includes(req.query.status)) {
            return res.status(400).json({
                message: `Invalid status value. Allowed values are: ${allowedStatuses.join(", ")}`
            })
        }
        if (!req.query.id || !req.query.status) {
            return res.status(400).json({
                message: "Note ID and status are required."
            })
        }
        const note = await NoteModel.updateNoteStatus(req.query.id, req.query.status)
        if (!note) {
            return res.status(404).json({
                message: "User note not found."
            })
        }
        return res.status(200).json({
            data: note
        })
    } catch(err){
        return res.status(500).json({message:err.message})
    }
}

 const deleteNote = async(req, res) => {
    try{
        const note = await NoteModel.deleteNote(req.query.id)
        if (!note) {
            return res.status(404).json({
                message: "User note not found."
            })
        }
        return res.status(200).json({
            data: note
        })
    } catch(err){
        return res.status(500).json({message: err.message})
    }
}

 const deleteAllNotes = async(req, res) => {
    try{
        const note = await NoteModel.deleteAllNotes(req.query.user_id)
        if (note.length === 0) {
            return res.status(404).json({
                message: "User doesn't exist, or has no notes."
            })
        }
        return res.status(200).json({
            results_length: note.length,
            data: {
                notedata: note
            }
        })
    } catch(err){
        return res.status(500).json({message: err.message})
    }
}

export default {
    getNote,
    getAllNotes,
    createNote,
    updateNoteContent,
    updateNoteTitle,
    updateNoteStatus,
    deleteAllNotes,
    deleteNote
}