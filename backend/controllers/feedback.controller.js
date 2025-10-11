import FeedbackModel from "../models/feedback.model.js"

const getFeedback = async(req, res) => {
    try{
        const feedback = await FeedbackModel.getFeedbackById(req.query.id)
        
        res.status(200).json({
        status: "success",
        feedbackdata: feedback
        })
    }
    catch(err){
        res.status(500).json({message: err.message})
    }
}

const getAllFeedback = async(req, res) => {
    try{
        const feedbacks = await FeedbackModel.getAllFeedback(req.query.user_id)

        res.status(200).json({
        status: "success",
        results_length: feedbacks.length,
        data: {
            feedbackdata: feedbacks
        }
    })
    }
    catch(err){
        res.status(500).json({message: err.message})
    }
}

const createFeedback = async(req, res) => {
    try{
        const feedback = await FeedbackModel.createFeedback(req.query.user_id, req.query.title  , req.query.description)
        res.status(200).json({
            status: "success",
            feedbackdata: feedback
        })
    }
    catch(err){
        res.status(500).json({message: err.message})
    }
}

const updateFeedbackTitle = async(req, res) => {
    try{
        const feedback = await FeedbackModel.updateFeedbackTitle(req.query.id, req.query.title)
        if (!feedback) {
            res.status(404).json({
                message: "User feedback not found."
            })
        }
        res.status(200).json({
            results_length: feedback.length,
            feedbackdata: feedback
            
        })
    }
    catch(err){
        res.status(500).json({message:err.message})
    }
}

const updateFeedbackDescription = async(req, res) => {
    try{
        const feedback = await FeedbackModel.updateFeedbackDescription(req.query.id, req.query.description)
        if (!feedback) {
            res.status(404).json({
                message: "User feedback not found."
            })
        }
        res.status(200).json({
            results_length: feedback.length,
            feedbackdata: feedback
            
        })
    }
    catch(err){
        res.status(500).json({message:err.message})
    }
}

const deleteFeedback = async(req, res) => {
    try{
        const feedback = await FeedbackModel.deleteFeedback(req.query.id)
        if (!feedback) {
            res.status(404).json({
                message: "User feedback not found."
            })
        }
        res.status(200).json({
            status: "success",
            feedbackdata: feedback
        })
    }
    catch(err){
        res.status(500).json({message: err.message})
    }
}

const deleteAllFeedback = async(req, res) => {
    try{
        const feedback = await FeedbackModel.deleteAllFeedback(req.query.user_id)
        if (!feedback) {
            res.status(404).json({
                message: "User has no feedback entries."
            })
        }
        res.status(200).json({
            results_length: feedback.length,
            data: {
                feedbackdata: feedback
            }
        })
    }
    catch(err){
        res.status(500).json({message: err.message})
    }
}


export default {
    getFeedback,
    getAllFeedback,
    createFeedback,
    updateFeedbackTitle,
    updateFeedbackDescription,
    deleteFeedback,
    deleteAllFeedback
}