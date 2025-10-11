// feedback.test.js
import request from "supertest"
import app from "../app.js"
import FeedbackModel from "../models/feedback.model.js"

jest.mock("../models/feedback.model.js")

describe("Feedback API", () => {
  describe("GET /api/v1/feedback", () => {
    it("Should return 200 with feedback if found", async () => {
      const mockFeedback = { id: "fb1", user_id: "user1", title: "Bug", description: "Fix this" }
      FeedbackModel.getFeedbackById.mockResolvedValueOnce(mockFeedback)

      const res = await request(app).get("/api/v1/feedback").query({ id: "fb1" })
      expect(res.status).toBe(200)
      expect(res.body.status).toEqual("success")
      expect(res.body.feedbackdata).toEqual(mockFeedback)
    })

    it("Should return 500 if model throws", async () => {
      FeedbackModel.getFeedbackById.mockRejectedValueOnce(new Error("DB error"))
      const res = await request(app).get("/api/v1/feedback").query({ id: "badid" })
      expect(res.status).toBe(500)
      expect(res.body.message).toEqual("DB error")
    })
  })

  describe("GET /api/v1/feedback/all", () => {
    it("Should return 200 with all feedback", async () => {
      const mockFeedbacks = [
        { id: "fb1", user_id: "user1", title: "Bug", description: "Fix this" },
        { id: "fb2", user_id: "user1", title: "Feature", description: "Add this" }
      ]
      FeedbackModel.getAllFeedback.mockResolvedValueOnce(mockFeedbacks)

      const res = await request(app).get("/api/v1/feedback/all").query({ user_id: "user1" })
      expect(res.status).toBe(200)
      expect(res.body.status).toEqual("success")
      expect(res.body.results_length).toBe(2)
      expect(res.body.data.feedbackdata).toEqual(mockFeedbacks)
    })

    it("Should return 500 if model throws", async () => {
      FeedbackModel.getAllFeedback.mockRejectedValueOnce(new Error("DB error"))
      const res = await request(app).get("/api/v1/feedback/all").query({ user_id: "user1" })
      expect(res.status).toBe(500)
      expect(res.body.message).toEqual("DB error")
    })
  })

  describe("POST /api/v1/feedback", () => {
    it("Should return 200 when feedback is created", async () => {
      const mockFeedback = { id: "fb1", user_id: "user1", title: "Bug", description: "Fix this" }
      FeedbackModel.createFeedback.mockResolvedValueOnce(mockFeedback)

      const res = await request(app)
        .post("/api/v1/feedback")
        .query({ user_id: "user1", title: "Bug", description: "Fix this" })
      expect(res.status).toBe(200)
      expect(res.body.feedbackdata).toEqual(mockFeedback)
    })

    it("Should return 500 if model throws", async () => {
      FeedbackModel.createFeedback.mockRejectedValueOnce(new Error("DB error"))
      const res = await request(app)
        .post("/api/v1/feedback")
        .query({ user_id: "user1", title: "Bug", description: "Fix this" })
      expect(res.status).toBe(500)
      expect(res.body.message).toEqual("DB error")
    })
  })

  describe("PATCH /api/v1/feedback/title", () => {
    it("Should return 404 if feedback not found", async () => {
      FeedbackModel.updateFeedbackTitle.mockResolvedValueOnce(null)
      const res = await request(app).patch("/api/v1/feedback/title").query({ id: "badid", title: "Updated" })
      expect(res.status).toBe(404)
      expect(res.body.message).toEqual("User feedback not found.")
    })

    it("Should return 200 when feedback title is updated", async () => {
      const mockUpdated = { id: "fb1", title: "Updated", description: "Fix this" }
      FeedbackModel.updateFeedbackTitle.mockResolvedValueOnce(mockUpdated)
      const res = await request(app).patch("/api/v1/feedback/title").query({ id: "fb1", title: "Updated" })
      expect(res.status).toBe(200)
      expect(res.body.feedbackdata).toEqual(mockUpdated)
    })
  })

  describe("PATCH /api/v1/feedback/description", () => {
    it("Should return 404 if feedback not found", async () => {
      FeedbackModel.updateFeedbackDescription.mockResolvedValueOnce(null)
      const res = await request(app).patch("/api/v1/feedback/description").query({ id: "badid", description: "Updated desc" })
      expect(res.status).toBe(404)
      expect(res.body.message).toEqual("User feedback not found.")
    })

    it("Should return 200 when feedback description is updated", async () => {
      const mockUpdated = { id: "fb1", title: "Bug", description: "Updated desc" }
      FeedbackModel.updateFeedbackDescription.mockResolvedValueOnce(mockUpdated)
      const res = await request(app).patch("/api/v1/feedback/description").query({ id: "fb1", description: "Updated desc" })
      expect(res.status).toBe(200)
      expect(res.body.feedbackdata).toEqual(mockUpdated)
    })
  })

  describe("DELETE /api/v1/feedback", () => {
    it("Should return 404 if feedback not found", async () => {
      FeedbackModel.deleteFeedback.mockResolvedValueOnce(null)
      const res = await request(app).delete("/api/v1/feedback").query({ id: "badid" })
      expect(res.status).toBe(404)
      expect(res.body.message).toEqual("User feedback not found.")
    })

    it("Should return 200 when feedback is deleted", async () => {
      const mockDeleted = { id: "fb1", title: "Bug", description: "Fix this" }
      FeedbackModel.deleteFeedback.mockResolvedValueOnce(mockDeleted)
      const res = await request(app).delete("/api/v1/feedback").query({ id: "fb1" })
      expect(res.status).toBe(200)
      expect(res.body.status).toBe("success")
      expect(res.body.feedbackdata).toEqual(mockDeleted)
    })
  })

  describe("DELETE /api/v1/feedback/all", () => {
    it("Should return 404 if no feedback found", async () => {
      FeedbackModel.deleteAllFeedback.mockResolvedValueOnce(null)
      const res = await request(app).delete("/api/v1/feedback/all").query({ user_id: "user1" })
      expect(res.status).toBe(404)
      expect(res.body.message).toEqual("User has no feedback entries.")
    })

    it("Should return 200 when all feedback is deleted", async () => {
      const mockDeleted = [
        { id: "fb1", title: "Bug" },
        { id: "fb2", title: "Feature" }
      ]
      FeedbackModel.deleteAllFeedback.mockResolvedValueOnce(mockDeleted)
      const res = await request(app).delete("/api/v1/feedback/all").query({ user_id: "user1" })
      expect(res.status).toBe(200)
      expect(res.body.results_length).toBe(2)
      expect(res.body.data.feedbackdata).toEqual(mockDeleted)
    })
  })
})