const { pool } = require("../db");

async function createWasteBin(req, res) {
  try {
    const { latitude, longitude, is_secure, notes } = req.body;

    if (latitude == null || longitude == null) {
      return res.status(400).json({ error: "Latitude and longitude are required" });
    }

    const result = await pool.query(
      `INSERT INTO waste_bins (latitude, longitude, is_secure, reported_by, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [latitude, longitude, is_secure !== false, req.user.id, notes]
    );

    res.status(201).json({ waste_bin: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create waste bin report" });
  }
}

async function getWasteBins(req, res) {
  try {
    const { lat, lng, radius, is_secure } = req.query;
    let query = `SELECT *, u.full_name as reported_by_name FROM waste_bins LEFT JOIN users u ON reported_by = u.id WHERE 1=1`;
    const params = [];

    if (is_secure !== undefined) {
      params.push(is_secure === "true");
      query += ` AND is_secure = $${params.length}`;
    }
    if (lat && lng && radius) {
      params.push(lat, lng, radius);
      query += ` AND (6371000 * acos(cos(radians($${params.length - 2})) * cos(radians(latitude)) *
         cos(radians(longitude) - radians($${params.length - 1})) +
         sin(radians($${params.length - 2})) * sin(radians(latitude)))) <= $${params.length}`;
    }

    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, params);
    res.json({ waste_bins: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch waste bins" });
  }
}

module.exports = { createWasteBin, getWasteBins };