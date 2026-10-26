const { pool } = require("../db");

async function getProfile(req, res) {
  try {
    const result = await pool.query(
      `SELECT u.id, u.email, u.role, u.full_name, u.phone, u.city, u.avatar_url, u.is_verified, u.created_at,
              COUNT(DISTINCT ir.id) FILTER (WHERE ir.reporter_id = u.id) as reports_count,
              COUNT(DISTINCT a.id) FILTER (WHERE a.listed_by_id = u.id) as animals_listed
       FROM users u
       LEFT JOIN incident_reports ir ON ir.reporter_id = u.id
       LEFT JOIN animals a ON a.listed_by_id = u.id
       WHERE u.id = $1
       GROUP BY u.id`,
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
}

async function updateProfile(req, res) {
  try {
    const { full_name, phone, city, avatar_url } = req.body;
    const result = await pool.query(
      `UPDATE users SET full_name = COALESCE($1, full_name), phone = COALESCE($2, phone),
         city = COALESCE($3, city), avatar_url = COALESCE($4, avatar_url)
       WHERE id = $5
       RETURNING id, email, role, full_name, phone, city, avatar_url, is_verified`,
      [full_name, phone, city, avatar_url, req.user.id]
    );
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update profile" });
  }
}

async function getUserReports(req, res) {
  try {
    const result = await pool.query(
      `SELECT * FROM incident_reports WHERE reporter_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ reports: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
}

async function getUserAnimals(req, res) {
  try {
    const result = await pool.query(
      `SELECT * FROM animals WHERE listed_by_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ animals: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch animals" });
  }
}

module.exports = { getProfile, updateProfile, getUserReports, getUserAnimals };