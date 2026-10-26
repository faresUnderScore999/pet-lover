const { pool } = require("../db");

async function createTNRCase(req, res) {
  try {
    const { animal_id, association_id, vet_id, procedure_date, estimated_cost, notes } = req.body;

    const result = await pool.query(
      `INSERT INTO tnr_cases (animal_id, rescuer_id, association_id, vet_id, procedure_date, estimated_cost, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [animal_id, req.user.id, association_id, vet_id, procedure_date, estimated_cost, notes]
    );

    res.status(201).json({ tnr_case: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create TNR case" });
  }
}

async function getTNRCases(req, res) {
  try {
    const { status } = req.query;
    let query = `
      SELECT t.*, u1.full_name as rescuer_name, u2.full_name as association_name, u3.full_name as vet_name,
             a.name as animal_name, a.species as animal_species
      FROM tnr_cases t
      LEFT JOIN users u1 ON t.rescuer_id = u1.id
      LEFT JOIN users u2 ON t.association_id = u2.id
      LEFT JOIN users u3 ON t.vet_id = u3.id
      LEFT JOIN animals a ON t.animal_id = a.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      params.push(status);
      query += ` AND t.status = $${params.length}`;
    }

    query += ` ORDER BY t.created_at DESC`;

    const result = await pool.query(query, params);
    res.json({ tnr_cases: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch TNR cases" });
  }
}

async function getTNRCaseById(req, res) {
  try {
    const result = await pool.query(
      `SELECT t.*, u1.full_name as rescuer_name, u2.full_name as association_name, u3.full_name as vet_name,
             a.name as animal_name, a.species as animal_species
       FROM tnr_cases t
       LEFT JOIN users u1 ON t.rescuer_id = u1.id
       LEFT JOIN users u2 ON t.association_id = u2.id
       LEFT JOIN users u3 ON t.vet_id = u3.id
       LEFT JOIN animals a ON t.animal_id = a.id
       WHERE t.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "TNR case not found" });
    }
    res.json({ tnr_case: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch TNR case" });
  }
}

async function updateTNRStatus(req, res) {
  try {
    const { status, vet_id, procedure_date } = req.body;
    const result = await pool.query(
      `UPDATE tnr_cases SET status = $1, vet_id = COALESCE($2, vet_id),
         procedure_date = COALESCE($3, procedure_date), updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [status, vet_id, procedure_date, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "TNR case not found" });
    }
    res.json({ tnr_case: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update TNR case" });
  }
}

module.exports = { createTNRCase, getTNRCases, getTNRCaseById, updateTNRStatus };