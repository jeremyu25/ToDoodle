import NoteModel from "../models/note.model.js"

const getNote = async (req, res) => {
    try {
        const { id } = req.params
        if (!id) {
            return res.status(400).json({
                status: "fail",
                message: "Note ID parameter is required",
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
        const user_id = req.user.id; // From authenticated JTW token

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


const createNote = async (req, res) => {
    try {
        const { folder_id, title, content, status } = req.body
        const user_id = req.user.id; // From authenticated JTW token

        if (!folder_id || !title) {
            return res.status(400).json({
                status: "fail",
                message: "folder_id and title are required",
            })
        }

        const allowedStatuses = ["not_started", "in_progress", "completed"]
        const safeStatus = allowedStatuses.includes(status) ? status : "not_started"
        const note = await NoteModel.createNote(user_id, folder_id, title, content, safeStatus)
        return res.status(201).json({
            status: "success",
            data: note
        })
    } catch (err) {
        console.error('createNote error:', err);
        return res.status(500).json({
            status: "error",
            message: err.message
        })
    }
}

const updateNoteContent = async (req, res) => {
    try {
        const { id } = req.params; // Use path parameter for note ID
        const { content } = req.body; // Use request body for data

        if (!id || content === undefined) {
            return res.status(400).json({
                status: "fail",
                message: "Note ID and content are required."
            })
        }

        const note = await NoteModel.updateNoteContent(id, content)
        if (!note) {
            return res.status(404).json({
                status: "fail",
                message: "User note not found."
            })
        }
        return res.status(200).json({
            status: "success",
            data: note
        })
    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: err.message
        })
    }
}
const updateNoteTitle = async (req, res) => {
    try {
        const { id } = req.params;
        const { title } = req.body;

        if (!id || !title) {
            return res.status(400).json({
                status: "fail",
                message: "Note ID and title are required."
            })
        }

        const note = await NoteModel.updateNoteTitle(id, title)
        if (!note) {
            return res.status(404).json({
                status: "fail",
                message: "User note not found."
            })
        }
        return res.status(200).json({
            status: "success",
            data: note
        })
    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: err.message
        })
    }
}

const updateNoteStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = ["not_started", "in_progress", "completed"]

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                status: "fail",
                message: `Invalid status value. Allowed values are: ${allowedStatuses.join(", ")}`
            })
        }

        if (!id || !status) {
            return res.status(400).json({
                status: "fail",
                message: "Note ID and status are required."
            })
        }

        const note = await NoteModel.updateNoteStatus(id, status)
        if (!note) {
            return res.status(404).json({
                status: "fail",
                message: "User note not found."
            })
        }
        return res.status(200).json({
            status: "success",
            data: note
        })
    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: err.message
        })
    }
}

const deleteNote = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                status: "fail",
                message: "Note ID is required."
            })
        }

        const note = await NoteModel.deleteNote(id)
        if (!note) {
            return res.status(404).json({
                status: "fail",
                message: "User note not found."
            })
        }
        return res.status(200).json({
            status: "success",
            data: note
        })
    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: err.message
        })
    }
}

 const deleteAllNotes = async(req, res) => {
    try{
        const note = await NoteModel.deleteAllNotes(req.query.user_id)
        if (note.length === 0) {
            return res.status(404).json({
                status: "fail",
                message: "User doesn't exist, or has no notes."
            })
        }
        return res.status(200).json({
            status: "success",
            results_length: note.length,
            data: {
                notedata: note
            }
        })
    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: err.message
        })
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