const { pool } = require("../db");

async function createSafetyFlag(req, res) {
  try {
    const { type, latitude, longitude, radius_meters, expires_at } = req.body;

    if (!type || latitude == null || longitude == null) {
      return res.status(400).json({ error: "Type, latitude, and longitude are required" });
    }

    const result = await pool.query(
      `INSERT INTO safety_flags (type, latitude, longitude, radius_meters, reported_by, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [type, latitude, longitude, radius_meters || 100, req.user.id, expires_at]
    );

    res.status(201).json({ flag: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create safety flag" });
  }
}

async function getSafetyFlags(req, res) {
  try {
    const { lat, lng, radius } = req.query;
    let query = `SELECT * FROM safety_flags WHERE expires_at IS NULL OR expires_at > NOW()`;
    const params = [];

    if (lat && lng && radius) {
      params.push(lat, lng, radius);
      query += ` AND (6371000 * acos(cos(radians($${params.length - 2})) * cos(radians(latitude)) *
         cos(radians(longitude) - radians($${params.length - 1})) +
         sin(radians($${params.length - 2})) * sin(radians(latitude)))) <= $${params.length}`;
    }

    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, params);
    res.json({ flags: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch safety flags" });
  }
}

module.exports = { createSafetyFlag, getSafetyFlags };