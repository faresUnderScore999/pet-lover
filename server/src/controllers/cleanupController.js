const { pool } = require("../db");

async function createCleanUp(req, res) {
  try {
    const { title, description, location, latitude, longitude, event_date, volunteers_needed } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const result = await pool.query(
      `INSERT INTO clean_up_initiatives (organizer_id, title, description, location, latitude, longitude, event_date, volunteers_needed)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [req.user.id, title, description, location, latitude, longitude, event_date, volunteers_needed || 10]
    );

    res.status(201).json({ initiative: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create clean-up initiative" });
  }
}

async function getCleanUps(req, res) {
  try {
    const { status } = req.query;
    let query = `SELECT c.*, u.full_name as organizer_name FROM clean_up_initiatives c LEFT JOIN users u ON c.organizer_id = u.id WHERE 1=1`;
    const params = [];

    if (status) {
      params.push(status);
      query += ` AND c.status = $${params.length}`;
    }

    query += ` ORDER BY c.created_at DESC`;

    const result = await pool.query(query, params);
    res.json({ initiatives: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch clean-up initiatives" });
  }
}

module.exports = { createCleanUp, getCleanUps };