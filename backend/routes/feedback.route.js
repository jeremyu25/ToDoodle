import express from "express"
import feedbackController from "../controllers/feedback.controller.js"

const router = express.Router()

router.get("/", feedbackController.getFeedback)
router.get("/all", feedbackController.getAllFeedback)
router.post("/", feedbackController.createFeedback)
router.patch("/title", feedbackController.updateFeedbackTitle)
router.patch("/description", feedbackController.updateFeedbackDescription)
router.delete("/", feedbackController.deleteFeedback)
router.delete("/all", feedbackController.deleteAllFeedback)

export default router