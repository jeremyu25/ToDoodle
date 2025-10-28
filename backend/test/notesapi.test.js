import request from "supertest"
// Tell Jest to mock the entire NoteModel module
import NoteModel from "../models/note.model.js"

jest.mock("../models/note.model.js")
jest.mock("../utils/verify.js", () => ({
  verifyToken: (req, res, next) => {
    req.user = { id: 1, name: "Mock User" }
    next()
  },
}))

import app from "../app.js"

describe("Note API", () => {
  describe("GET /api/v1/note/:id", () => {
    it("Should return 404 if note is not found", async () => {
      NoteModel.getNoteById.mockResolvedValueOnce(null) // simulate no note

      const res = await request(app).get("/api/v1/note/6e091295-53aa-4e79-85a8-8ae504a46f31")
      expect(res.status).toBe(404)
      expect(res.body.message).toBe("Note with id 6e091295-53aa-4e79-85a8-8ae504a46f31 not found")
    })

    it("Should return 200 and the note if found", async () => {
      const mockNote = {
          "id": "6e091295-53aa-4e79-85a8-8ae504a46f31",
          "user_id": "1515e90d-6dc4-453e-bd42-ced28a0e75a9",
          "folder_id": "4ea68664-713a-41b9-86eb-0fe25e0d53c3",
          "title": "HolyC manual",
          "content": "voodoo",
          "created_at": "2025-09-04T15:18:30.204Z",
          "updated_at": "2025-09-06T07:07:52.111Z",
          "status": "completed"
  }
      NoteModel.getNoteById.mockResolvedValueOnce(mockNote) 
      const res = await request(app).get("/api/v1/note/6e091295-53aa-4e79-85a8-8ae504a46f31")
      expect(res.status).toBe(200)
      expect(res.body.status).toBe("success")
      expect(res.body.data).toEqual(mockNote)
    })
  })

  describe("GET api/v1/note", () => {
    it("Should return 200 and the notes if found", async () =>{

      const mockNotes = [
              {
                  "id": "e58ffe93-ce4f-4a09-9292-4bb634f9de35",
                  "user_id": "2ef2042c-fdcd-4377-856c-db4573b041c2",
                  "folder_id": "b193dc98-6975-4400-9a70-1310d104aa21",
                  "title": "Meeting Notes",
                  "content": "Discuss project deadlines and deliverables.",
                  "created_at": "2025-08-12T13:46:48.399Z",
                  "updated_at": "2025-08-12T13:46:48.399Z",
                  "status": "not_started"
              },
              {
                  "id": "a5121420-8b88-4d11-88e3-f5d6021b8063",
                  "user_id": "2ef2042c-fdcd-4377-856c-db4573b041c2",
                  "folder_id": "28efc7aa-2f85-4674-966f-37402822f1cd",
                  "title": "Grocery List",
                  "content": "Milk, Eggs, Bread, Butter",
                  "created_at": "2025-08-12T13:46:48.399Z",
                  "updated_at": "2025-08-12T13:46:48.399Z",
                  "status": "not_started"
              }
            ]
  
      NoteModel.getAllNotes.mockResolvedValueOnce(mockNotes)
      const res = await request(app).get("/api/v1/note")
      expect(res.status).toBe(200)
      expect(res.body.status).toEqual("success")
      expect(res.body.results_length).toBe(2)
      expect(res.body.data.notedata).toEqual(mockNotes)
    })
    it("Should return 200 but empty array if user has no notes", async () => {
      const mockNotes = []
      const mockRequest = {
        "user_id": "2ef2042c-fdcd-4377-856c-db4573b041c2"
      }
      NoteModel.getAllNotes.mockResolvedValueOnce(mockNotes)
      const res = await request(app).get("/api/v1/note")
      expect(res.status).toBe(200)
      expect(res.body.status).toBe("success")
      expect(res.body.results_length).toBe(0)
      expect(res.body.data.notedata).toEqual(mockNotes)
    })

  })
  describe("POST api/v1/note", () =>{
    it("Should return 201 after note creation", async () => {
          const mockNote = {
          "id": "6e091295-53aa-4e79-85a8-8ae504a46f22",
          "user_id": "1515e90d-6dc4-453e-bd42-ced28a0e75a7",
          "folder_id": "4ea68664-713a-41b9-86eb-0fe25e0d53c3",
          "title": "HolyC manual",
          "content": "voodoo",
          "created_at": "2025-09-04T15:18:30.204Z",
          "updated_at": "2025-09-06T07:07:52.111Z",
          "status": "completed"
  }
          const mockRequest = {
          "user_id": "1515e90d-6dc4-453e-bd42-ced28a0e75a7",
          "folder_id": "4ea68664-713a-41b9-86eb-0fe25e0d53c3",
          "title": "HolyC manual",
          "content": "voodoo",
          "status": "completed"
  }
      NoteModel.createNote.mockResolvedValueOnce(mockNote)
      const res = await request(app).post("/api/v1/note").send(mockRequest)
      expect(res.status).toBe(201)
      expect(res.body.data).toEqual(mockNote)
    })
    it("Should return 400 if user id, folder id or title are not given", async () =>{
      const res = await request(app).post("/api/v1/note")
      expect(res.status).toBe(400)
      expect(res.body.status).toEqual("fail")
    })
  })

    describe("PATCH api/v1/note/content", () => {
      it("Should return 200 after updating content", async () =>{
        const mockRequest = {
          "content": "changed content"
        }
          const mockNote = {
          "id": "6e091295-53aa-4e79-85a8-8ae504a46f29",
          "user_id": "1515e90d-6dc4-453e-bd42-ced28a0e75a7",
          "folder_id": "4ea68664-713a-41b9-86eb-0fe25e0d53c3",
          "title": "HolyC manual",
          "content": "changed content",
          "created_at": "2025-09-04T15:18:30.204Z",
          "updated_at": "2025-09-06T07:07:52.111Z",
          "status": "completed"
  }
        NoteModel.updateNoteContent.mockResolvedValueOnce(mockNote)
        const res = await request(app).patch("/api/v1/note/6e091295-53aa-4e79-85a8-8ae504a46f29/content").send(mockRequest)
        expect(res.status).toBe(200)
        expect(res.body.data).toEqual(mockNote)
      })
      it("Should return 400 if no note id or content is given",  async () => {
        const mockRequest = {
        }
        const res = await request(app).patch("/api/v1/note/6e091295-53aa-4e79-85a8-8ae504a46f22/content").send(mockRequest)
        expect(res.status).toBe(400)
        expect(res.body.message).toEqual("Note ID and content are required.")
      })
      it("Should return 404 if no note id is found", async () => {
        const mockRequest = {
          "content": "stuff"
        }
        NoteModel.updateNoteContent.mockResolvedValueOnce(null)
        const res = await request(app).patch("/api/v1/note/6e091295-53aa-4e79-85a8-8ae504a46f22/content").send(mockRequest)
        expect(res.status).toBe(404)
        expect(res.body.message).toEqual("User note not found.")
      })
    })
  describe("PATCH api/v1/note/title", () => {
    it("Should return 200 after updating title", async () =>{
      const mockRequest = {
        "title": "Holy Java Manual"
      }
      const mockNote = {
        "id": "6e091295-53aa-4e79-85a8-8ae504a46f22",
        "user_id": "1515e90d-6dc4-453e-bd42-ced28a0e75a7",
        "folder_id": "4ea68664-713a-41b9-86eb-0fe25e0d53c3",
        "title": "Holy Java Manual",
        "content": "changed content",
        "created_at": "2025-09-04T15:18:30.204Z",
        "updated_at": "2025-09-06T07:07:52.111Z",
        "status": "in_progress"
      }
      NoteModel.updateNoteTitle.mockResolvedValueOnce(mockNote)
      const res = await request(app).patch("/api/v1/note/6e091295-53aa-4e79-85a8-8ae504a46f22/title").send(mockRequest)
      expect(res.status).toBe(200)
      expect(res.body.data).toEqual(mockNote)
    })

    it("Should return 400 if no note id or title is given", async () => {
      const res = await request(app).patch("/api/v1/note/6e091295-53aa-4e79-85a8-8ae504a46f22/title")
      expect(res.status).toBe(400)
      expect(res.body.message).toEqual("Note ID and title are required.")
    })

    it("Should return 404 if no note is found", async () => {
      const mockRequest = {
        "title": "Another title"
      }
      NoteModel.updateNoteTitle.mockResolvedValueOnce(null)
      const res = await request(app).patch("/api/v1/note/6e091295-53aa-4e79-85a8-8ae504a46f22/title").send(mockRequest)
      expect(res.status).toBe(404)
      expect(res.body.message).toEqual("User note not found.")
    })
  })

  describe("PATCH api/v1/note/6e091295-53aa-4e79-85a8-8ae504a46f22/status", () => {
    it("Should return 200 after updating status", async () =>{
      const mockRequest = {
        "status": "in_progress"
      }
      const mockNote = {
        "id": "6e091295-53aa-4e79-85a8-8ae504a46f22",
        "user_id": "1515e90d-6dc4-453e-bd42-ced28a0e75a7",
        "folder_id": "4ea68664-713a-41b9-86eb-0fe25e0d53c3",
        "title": "HolyC manual",
        "content": "changed content",
        "created_at": "2025-09-04T15:18:30.204Z",
        "updated_at": "2025-09-06T07:07:52.111Z",
        "status": "in_progress"
      }
      NoteModel.updateNoteStatus.mockResolvedValueOnce(mockNote)
      const res = await request(app).patch("/api/v1/note/6e091295-53aa-4e79-85a8-8ae504a46f22/status").send(mockRequest)
      expect(res.status).toBe(200)
      expect(res.body.data).toEqual(mockNote)
    })

    it("Should return 400 if no note id or status is given", async () => {
      const res = await request(app).patch("/api/v1/note/6e091295-53aa-4e79-85a8-8ae504a46f22/status")
      expect(res.status).toBe(400)
      expect(res.body.message).toEqual("Invalid status value. Allowed values are: not_started, in_progress, completed")
    })

    it("Should return 404 if no note is found", async () => {
      const mockRequest = {
        "status": "completed"
      }
      NoteModel.updateNoteStatus.mockResolvedValueOnce(null)
      const res = await request(app).patch("/api/v1/note/6e091295-53aa-4e79-85a8-8ae504a46f22/status").send(mockRequest)
      expect(res.status).toBe(404)
      expect(res.body.message).toEqual("User note not found.")
    })
  })

    describe("DELETE api/v1/note/:id", () => {
      it("Should return 200 and the deleted note after note deletion", async () => {
        
      const mockResponse = {
        "id": "6e091295-53aa-4e79-85a8-8ae504a46f22",
        "user_id": "1515e90d-6dc4-453e-bd42-ced28a0e75a7",
        "folder_id": "4ea68664-713a-41b9-86eb-0fe25e0d53c3",
        "title": "HolyC manual",
        "content": "changed content",
        "created_at": "2025-09-04T15:18:30.204Z",
        "updated_at": "2025-09-06T07:07:52.111Z",
        "status": "in_progress"
      }
      NoteModel.deleteNote.mockResolvedValueOnce(mockResponse)
      const res = await(request(app).delete("/api/v1/note/6e091295-53aa-4e79-85a8-8ae504a46f22"))
      expect(res.status).toBe(200)
      expect(res.body.data).toEqual(mockResponse)
      })
      it("Should return 404 if the note to be deleted does not exist", async () => {
      NoteModel.deleteNote.mockResolvedValueOnce(null)
      const res = await(request(app).delete("/api/v1/note/6e091295-53aa-4e79-85a8-8ae504a46f22"))
      expect(res.status).toBe(404)
      expect(res.body.message).toBe("User note not found.")
    })
    })
    describe("DELETE /api/v1/note", () => {
      it("Should return 200 and the notes if deletion of all notes is successful", async () => {
        const mockRequest = {
        "user_id":"6e091295-53aa-4e79-85a8-8ae504a46f22"
      }
      const mockNotes = [
              {
                  "id": "e58ffe93-ce4f-4a09-9292-4bb634f9de35",
                  "user_id": "2ef2042c-fdcd-4377-856c-db4573b041c2",
                  "folder_id": "b193dc98-6975-4400-9a70-1310d104aa21",
                  "title": "Meeting Notes",
                  "content": "Discuss project deadlines and deliverables.",
                  "created_at": "2025-08-12T13:46:48.399Z",
                  "updated_at": "2025-08-12T13:46:48.399Z",
                  "status": "not_started"
              },
              {
                  "id": "a5121420-8b88-4d11-88e3-f5d6021b8063",
                  "user_id": "2ef2042c-fdcd-4377-856c-db4573b041c2",
                  "folder_id": "28efc7aa-2f85-4674-966f-37402822f1cd",
                  "title": "Grocery List",
                  "content": "Milk, Eggs, Bread, Butter",
                  "created_at": "2025-08-12T13:46:48.399Z",
                  "updated_at": "2025-08-12T13:46:48.399Z",
                  "status": "not_started"
              }
            ]
      NoteModel.deleteAllNotes.mockResolvedValueOnce(mockNotes)
      const res = await(request(app).delete("/api/v1/note").query(mockRequest))
      expect(res.status).toBe(200)
      expect(res.body.results_length).toBe(2)
      expect(res.body.data.notedata).toEqual(mockNotes)}
      )
      it("Should return 404 if user doesn't exist or has no notes", async () => {
        const mockRequest = {
        "user_id":"6e091295-53aa-4e79-85a8-8ae504a46f22"
      }
      NoteModel.deleteAllNotes.mockResolvedValueOnce(null)
      const res = await(request(app).delete("/api/v1/note").query(mockRequest))
      expect(res.status).toBe(404)
      expect(res.body.message).toBe("User doesn't exist, or has no notes.")
    
      })
      })
  })