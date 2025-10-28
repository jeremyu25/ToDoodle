import request from "supertest"
jest.mock("../utils/verify.js")

jest.mock("../utils/verify.js", () => ({
  verifyToken: (req, res, next) => {
    req.user = { id: 1, name: "Mock User" }
    next()
  },
}))
import app from "../app.js"
import FolderModel from "../models/folder.model.js"

jest.mock("../models/folder.model.js")

describe("Folder API", () => {
  describe("GET /api/v1/folder/:id", () => {

    it("Should return 404 if folder not found", async () => {
      FolderModel.getFolderById.mockResolvedValueOnce(null)
      const res = await request(app).get("/api/v1/folder/notexists")
      expect(res.status).toBe(404)
      expect(res.body.message).toEqual("User folder not found.")
    })

    it("Should return 200 with folder data if found", async () => {
      const mockFolder = { id: "folder1", name: "Work", description: "Work projects" }
      FolderModel.getFolderById.mockResolvedValueOnce(mockFolder)
      const res = await request(app).get("/api/v1/folder/folder1")
      expect(res.status).toBe(200)
      expect(res.body.status).toEqual("success")
      expect(res.body.data).toEqual(mockFolder)
    })
  })

  describe("GET /api/v1/folder", () => {

    it("Should return 200 with empty array if no folders found", async () => {
      FolderModel.getAllFolders.mockResolvedValueOnce([])
      const res = await request(app).get("/api/v1/folder").query({ user_id: "user123" })
      expect(res.status).toBe(200)
      expect(res.body.results_length).toBe(0)
      expect(res.body.data.folderdata).toEqual([])
    })

    it("Should return 200 with folders if found", async () => {
      const mockFolders = [
        { id: "folder1", name: "Work", description: "Work projects" },
        { id: "folder2", name: "Personal", description: "Personal tasks" }
      ]
      FolderModel.getAllFolders.mockResolvedValueOnce(mockFolders)
      const res = await request(app).get("/api/v1/folder").query({ user_id: "user123" })
      expect(res.status).toBe(200)
      expect(res.body.status).toEqual("success")
      expect(res.body.results_length).toBe(2)
      expect(res.body.data.folderdata).toEqual(mockFolders)
    })
  })

  describe("POST /api/v1/folder", () => {
    it("Should return 201 when folder is created", async () => {
      const mockFolder = { id: "folder1", user_id: "user123", name: "New Folder", description: "Desc" }
      FolderModel.createFolder.mockResolvedValueOnce(mockFolder)
      const res = await request(app)
        .post("/api/v1/folder")
        .send({ name: "New Folder", description: "Desc" })
      expect(res.status).toBe(201)
      expect(res.body.status).toEqual("success")
      expect(res.body.data).toEqual(mockFolder)
    })
  })

  describe("PATCH /api/v1/folder/:id/name", () => {
    it("Should return 400 if id or name is missing", async () => {
      const res = await request(app).patch("/api/v1/folder/folder123/name")
      expect(res.status).toBe(400)
      expect(res.body.message).toEqual("Folder ID and new folder name are required.")
    })

    it("Should return 404 if folder not found", async () => {
      FolderModel.updateFolderName.mockResolvedValueOnce(null)
      const res = await request(app).patch("/api/v1/folder/notexists/name").send({name: "Renamed" })
      expect(res.status).toBe(404)
      expect(res.body.message).toEqual("User folder not found.")
    })

    it("Should return 200 when folder name is updated", async () => {
      const mockUpdated = { id: "folder1", name: "Renamed Folder", description: "Desc" }
      FolderModel.updateFolderName.mockResolvedValueOnce(mockUpdated)
      const res = await request(app).patch("/api/v1/folder/folder123/name").send({name: "Renamed Folder" })
      expect(res.status).toBe(200)
      expect(res.body.status).toEqual("success")
      expect(res.body.data).toEqual(mockUpdated)
    })
  })

  describe("PATCH /api/v1/folder/description", () => {
    it("Should return 400 if id or description is missing", async () => {
      const res = await request(app).patch("/api/v1/folder/folder123/description")
      expect(res.status).toBe(400)
      expect(res.body.message).toEqual("Folder ID and new folder description are required.")
    })

    it("Should return 404 if folder not found", async () => {
      FolderModel.updateFolderDescription.mockResolvedValueOnce(null)
      const res = await request(app).patch("/api/v1/folder/notexists/description").send({description: "New Desc" })
      expect(res.status).toBe(404)
      expect(res.body.message).toEqual("User folder not found.")
    })

    it("Should return 200 when folder description is updated", async () => {
      const mockUpdated = { id: "folder1", name: "Work", description: "Updated Desc" }
      FolderModel.updateFolderDescription.mockResolvedValueOnce(mockUpdated)
      const res = await request(app).patch("/api/v1/folder/folder123/description").send({ description: "Updated Desc" })
      expect(res.status).toBe(200)
      expect(res.body.status).toEqual("success")
      expect(res.body.data).toEqual(mockUpdated)
    })
  })

  describe("DELETE /api/v1/folder/:id", () => {
    it("Should return 404 if folder not found", async () => {
      FolderModel.deleteFolder.mockResolvedValueOnce(null)
      const res = await request(app).delete("/api/v1/folder/nonexistent")
      expect(res.status).toBe(404)
      expect(res.body.message).toEqual("User folder not found.")
    })

    it("Should return 200 when folder is deleted", async () => {
      const mockDeleted = { id: "folder1", name: "Old Folder" }
      FolderModel.deleteFolder.mockResolvedValueOnce(mockDeleted)
      const res = await request(app).delete("/api/v1/folder/folder1")
      expect(res.status).toBe(200)
      expect(res.body.data).toEqual(mockDeleted)
    })
  })

  describe("DELETE /api/v1/folder", () => {
    it("Should return 404 if no folders found", async () => {
      FolderModel.deleteAllFolders.mockResolvedValueOnce([])
      const res = await request(app).delete("/api/v1/folder")
      expect(res.status).toBe(404)
      expect(res.body.message).toEqual("User doesn't exist, or has no folders.")
    })

    it("Should return 200 when all folders are deleted", async () => {
      const mockDeleted = [
        { id: "folder1", name: "Work" },
        { id: "folder2", name: "Personal" }
      ]
      FolderModel.deleteAllFolders.mockResolvedValueOnce(mockDeleted)
      const res = await request(app).delete("/api/v1/folder")
      expect(res.status).toBe(200)
      expect(res.body.results_length).toBe(2)
      expect(res.body.data.folderdata).toEqual(mockDeleted)
    })
  })
})