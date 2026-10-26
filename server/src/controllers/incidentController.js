const { pool } = require("../db");

async function createIncident(req, res) {
  try {
    const { type, latitude, longitude, description, severity, image_url } = req.body;
    const reporter_id = req.user.id;

    if (!type || latitude == null || longitude == null) {
      return res.status(400).json({ error: "Type, latitude, and longitude are required" });
    }

    const result = await pool.query(
      `INSERT INTO incident_reports (reporter_id, type, latitude, longitude, description, severity, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [reporter_id, type, latitude, longitude, description, severity || "medium", image_url]
    );

    res.status(201).json({ incident: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create incident report" });
  }
}

async function getIncidents(req, res) {
  try {
    const { type, status, lat, lng, radius } = req.query;
    let query = `
      SELECT ir.*, u.full_name as reporter_name, u.role as reporter_role
      FROM incident_reports ir
      LEFT JOIN users u ON ir.reporter_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (type) {
      params.push(type);
      query += ` AND ir.type = $${params.length}`;
    }
    if (status) {
      params.push(status);
      query += ` AND ir.status = $${params.length}`;
    }
    if (lat && lng && radius) {
      params.push(lat, lng, radius);
      query += ` AND (6371000 * acos(cos(radians($${params.length - 2})) * cos(radians(ir.latitude)) *
         cos(radians(ir.longitude) - radians($${params.length - 1})) +
         sin(radians($${params.length - 2})) * sin(radians(ir.latitude)))) <= $${params.length}`;
    }

    query += ` ORDER BY ir.created_at DESC`;

    const result = await pool.query(query, params);
    res.json({ incidents: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch incidents" });
  }
}

async function getIncidentById(req, res) {
  try {
    const result = await pool.query(
      `SELECT ir.*, u.full_name as reporter_name, u.role as reporter_role
       FROM incident_reports ir
       LEFT JOIN users u ON ir.reporter_id = u.id
       WHERE ir.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Incident not found" });
    }
    res.json({ incident: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch incident" });
  }
}

async function updateIncidentStatus(req, res) {
  try {
    const { status } = req.body;
    const result = await pool.query(
      `UPDATE incident_reports SET status = $1, resolved_at = CASE WHEN $2 = 'resolved' THEN NOW() ELSE resolved_at END
       WHERE id = $3
       RETURNING *`,
      [status, status, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Incident not found" });
    }
    res.json({ incident: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update incident" });
  }
}

module.exports = { createIncident, getIncidents, getIncidentById, updateIncidentStatus };