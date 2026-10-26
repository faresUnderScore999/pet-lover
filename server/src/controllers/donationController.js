const { pool } = require("../db");

async function createDonation(req, res) {
  try {
    const { tnr_case_id, animal_id, amount, currency, message } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }

    const result = await pool.query(
      `INSERT INTO donations (tnr_case_id, animal_id, donor_id, amount, currency, message)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [tnr_case_id, animal_id, req.user.id, amount, currency || "TND", message]
    );

    res.status(201).json({ donation: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create donation" });
  }
}

async function getDonations(req, res) {
  try {
    const { tnr_case_id, animal_id } = req.query;
    let query = `SELECT d.*, u.full_name as donor_name FROM donations d LEFT JOIN users u ON d.donor_id = u.id WHERE 1=1`;
    const params = [];

    if (tnr_case_id) {
      params.push(tnr_case_id);
      query += ` AND d.tnr_case_id = $${params.length}`;
    }
    if (animal_id) {
      params.push(animal_id);
      query += ` AND d.animal_id = $${params.length}`;
    }

    query += ` ORDER BY d.created_at DESC`;

    const result = await pool.query(query, params);
    res.json({ donations: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch donations" });
  }
}

module.exports = { createDonation, getDonations };