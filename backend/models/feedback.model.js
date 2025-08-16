const db = require("../db/index.js")

const getFeedbackById = async(id) => {
    const results = await db.query(`select * from feedback where id = $1`, [id])
    return results.rows
}

const getAllFeedback = async(user_id) => {
    const results = await db.query(`select * from feedback where user_id = $1`, [user_id])
    return results.rows
}

const createFeedback = async (user_id, title, description) => {
  const res = await db.query(
    'INSERT INTO feedback (user_id, title, description) VALUES ($1, $2, $3) RETURNING *',
    [user_id, title, description]
  );
  return res.rows[0];
};

const updateFeedbackTitle = async(id, title) => {
    const results = await db.query(`UPDATE feedback SET title = $1 WHERE id = $2 RETURNING *`, [title, id])
    return results.rows
}

const updateFeedbackDescription = async(id, description) => {
    const results = await db.query(`UPDATE feedback SET description = $1 WHERE id = $2 RETURNING *`, [description, id])
    return results.rows
}

const deleteFeedback = async(id) => {
    const results = await db.query(`DELETE FROM feedback WHERE id = $1 RETURNING *`, [id])
    return results.rows
}


const deleteAllFeedback = async(user_id) => {
    const results = await db.query(`DELETE FROM feedback WHERE user_id = $1 RETURNING *`, [user_id])
    return results.rows
}
module.exports = {
    getFeedbackById,
    getAllFeedback,
    createFeedback,
    updateFeedbackTitle,
    updateFeedbackDescription,
    deleteFeedback,
    deleteAllFeedback
}