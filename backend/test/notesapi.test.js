import request from "supertest"
import app from "../app.js"
import NoteModel from "../models/note.model.js"

// Tell Jest to mock the entire NoteModel module
jest.mock("../models/note.model.js")

describe("GET /api/v1/note", () => {
  it("should return 400 if id is missing", async () => {
    const res = await request(app).get("/api/v1/note")
    expect(res.status).toBe(400)
    expect(res.body.message).toBe("Note ID query param is required")
  })

  it("should return 404 if note is not found", async () => {
    NoteModel.getNoteById.mockResolvedValueOnce(null) // simulate no note
    const res = await request(app).get("/api/v1/note?id=6e091295-53aa-4e79-85a8-8ae504a46f31")
    expect(res.status).toBe(404)
    expect(res.body.message).toBe("Note with id 6e091295-53aa-4e79-85a8-8ae504a46f31 not found")
  })

  it("should return 200 and the note if found", async () => {
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
    const res = await request(app).get("/api/v1/note?id=6e091295-53aa-4e79-85a8-8ae504a46f31")
    expect(res.status).toBe(200)
    expect(res.body.status).toBe("success")
    expect(res.body.data).toEqual(mockNote)
  })
})

describe("POST api/v1/note", () =>{
  it("should return 201 after note creation", async () => {
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
    const res = await request(app).post("/api/v1/note").query(mockRequest).set('Accept', 'application/json')
    expect(res.status).toBe(201)
    expect(res.body.data).toEqual(mockNote)
  })
})

  describe("PATCH api/v1/note/content", () => {
    it("Should return 200 after updating content", async () =>{
      const mockRequest = {
        "id":"6e091295-53aa-4e79-85a8-8ae504a46f22",
        "content": "changed content"
      }
        const mockNote = {
        "id": "6e091295-53aa-4e79-85a8-8ae504a46f22",
        "user_id": "1515e90d-6dc4-453e-bd42-ced28a0e75a7",
        "folder_id": "4ea68664-713a-41b9-86eb-0fe25e0d53c3",
        "title": "HolyC manual",
        "content": "changed content",
        "created_at": "2025-09-04T15:18:30.204Z",
        "updated_at": "2025-09-06T07:07:52.111Z",
        "status": "completed"
}
      NoteModel.updateNoteContent.mockResolvedValueOnce(mockNote)
      const res = await request(app).patch("/api/v1/note/content").query(mockRequest).set('Accept', 'application/json')
      expect(res.status).toBe(200)
      expect(res.body.data).toEqual(mockNote)
    })
  })
    describe("PATCH api/v1/note/title", () => {
    it("Should return 200 after updating title", async () =>{
      const mockRequest = {
        "id":"6e091295-53aa-4e79-85a8-8ae504a46f22",
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
      const res = await request(app).patch("/api/v1/note/title").query(mockRequest).set('Accept', 'application/json')
      expect(res.status).toBe(200)
      expect(res.body.data).toEqual(mockNote)
    })
  })

      describe("PATCH api/v1/note/status", () => {
    it("Should return 200 after updating status", async () =>{
      const mockRequest = {
        "id":"6e091295-53aa-4e79-85a8-8ae504a46f22",
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
      const res = await request(app).patch("/api/v1/note/status").query(mockRequest).set('Accept', 'application/json')
      expect(res.status).toBe(200)
      expect(res.body.data).toEqual(mockNote)
    })
  })