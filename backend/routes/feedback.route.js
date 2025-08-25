const express = require("express")

const router = express.Router()

const feedbackController = require("../controllers/feedback.controller.js")

router.get("/", feedbackController.getFeedback)
router.get("/all", feedbackController.getAllFeedback)
router.post("/", feedbackController.createFeedback)
router.patch("/title", feedbackController.updateFeedbackTitle)
router.patch("/description", feedbackController.updateFeedbackDescription)
router.delete("/", feedbackController.deleteFeedback)
router.delete("/all", feedbackController.deleteAllFeedback)

module.exports = router