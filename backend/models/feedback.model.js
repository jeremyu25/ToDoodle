const db = require("../db/index.js");

const getFeedbackById = async (id) => {
  try {
    const results = await db.query(
      `SELECT * FROM feedback WHERE id = $1`,
      [id]
    );

    if (results.rows.length === 0) {
      throw new Error("Feedback not found.")
    }

    return results.rows[0]
  } catch (error) {
    console.error("Error getting feedback by ID from database:", error.message);
    throw new Error("DB error while getting feedback.");
  }
};

const getAllFeedback = async (user_id) => {
  try {
    const results = await db.query(
      `SELECT * FROM feedback WHERE user_id = $1`,
      [user_id]
    );
    if (results.rows.length === 0) {
      throw new Error("User ID not found or user has no feedback.")
    }
    return results.rows;
  } catch (error) {
    console.error("Error getting all feedback of a user from database:", error.message);
    throw new Error("DB error while getting feedback for user.");
  }
};

const createFeedback = async (user_id, title, description) => {
  try {
    const results = await db.query(
      `INSERT INTO feedback (user_id, title, description) 
       VALUES ($1, $2, $3) RETURNING *`,
      [user_id, title, description]
    );

    if (results.rows.length === 0) {
      throw new Error("Unable to create feedback in DB.");
    }

    return results.rows[0];
     } catch (error) {
    console.error("Error creating feedback in database:", error.message);
    throw new Error("DB error while creating feedback.");
  }
};

const updateFeedbackTitle = async (id, title) => {
  try {
    const results = await db.query(
      `UPDATE feedback SET title = $1 WHERE id = $2 RETURNING *`,
      [title, id]
    );

    if (results.rows.length === 0) {
      throw new Error("Feedback not found.");
    }

    return results.rows[0];
  } catch (error) {
    console.error("Error updating feedback title in database:", error.message);
    throw new Error("DB error while updating feedback title.");
  }
};

const updateFeedbackDescription = async (id, description) => {
  try {
    const results = await db.query(
      `UPDATE feedback SET description = $1 WHERE id = $2 RETURNING *`,
      [description, id]
    );

    if (results.rows.length === 0) {
      throw new Error("Feedback not found.");
    }

    return results.rows[0];
  } catch (error) {
    console.error("Error updating feedback description in database:", error.message);
    throw new Error("DB error while updating feedback description.");
  }
};

const deleteFeedback = async (id) => {
  try {
    const results = await db.query(
      `DELETE FROM feedback WHERE id = $1 RETURNING *`,
      [id]
    );

    if (results.rows.length === 0) {
      throw new Error("Feedback not found.");
    }

    return results.rows[0];
  } catch (error) {
    console.error("Error deleting feedback in database:", error.message);
    throw new Error("DB error while deleting feedback.");
  }
};

const deleteAllFeedback = async (user_id) => {
  try {
    const results = await db.query(
      `DELETE FROM feedback WHERE user_id = $1 RETURNING *`,
      [user_id]
    );

    if (results.rows.length === 0) {
      throw new Error("User ID not found or user has no feedback, nothing deleted.");
    }
    return results.rows;
  } catch (error) {
    console.error("Error deleting all feedback for a user from database:", error.message);
    throw new Error("DB error while deleting feedback.");
  }
};

module.exports = {
  getFeedbackById,
  getAllFeedback,
  createFeedback,
  updateFeedbackTitle,
  updateFeedbackDescription,
  deleteFeedback,
  deleteAllFeedback
};