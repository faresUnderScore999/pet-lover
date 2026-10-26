const { pool } = require("../db");

async function createAnimal(req, res) {
  try {
    const { name, species, age, gender, health_status, sterilized, vaccinated, location, latitude, longitude, photos, description } = req.body;

    if (!species) {
      return res.status(400).json({ error: "Species is required" });
    }

    const result = await pool.query(
      `INSERT INTO animals (listed_by_id, name, species, age, gender, health_status, sterilized, vaccinated, location, latitude, longitude, photos, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [req.user.id, name, species, age, gender, health_status, sterilized || false, vaccinated || false, location, latitude, longitude, JSON.stringify(photos || []), description]
    );

    res.status(201).json({ animal: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create animal listing" });
  }
}

async function getAnimals(req, res) {
  try {
    const { species, adoption_status, lat, lng, radius } = req.query;
    let query = `SELECT a.*, u.full_name as listed_by_name, u.city as listed_by_city
      FROM animals a
      LEFT JOIN users u ON a.listed_by_id = u.id
      WHERE 1=1`;
    const params = [];

    if (species) {
      params.push(species);
      query += ` AND a.species = $${params.length}`;
    }
    if (adoption_status) {
      params.push(adoption_status);
      query += ` AND a.adoption_status = $${params.length}`;
    }
    if (lat && lng && radius) {
      params.push(lat, lng, radius);
      query += ` AND (6371000 * acos(cos(radians($${params.length - 2})) * cos(radians(a.latitude)) *
         cos(radians(a.longitude) - radians($${params.length - 1})) +
         sin(radians($${params.length - 2})) * sin(radians(a.latitude)))) <= $${params.length}`;
    }

    query += ` ORDER BY a.created_at DESC`;

    const result = await pool.query(query, params);
    res.json({ animals: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch animals" });
  }
}

async function getAnimalById(req, res) {
  try {
    const result = await pool.query(
      `SELECT a.*, u.full_name as listed_by_name, u.phone as listed_by_phone, u.city as listed_by_city
       FROM animals a
       LEFT JOIN users u ON a.listed_by_id = u.id
       WHERE a.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Animal not found" });
    }
    res.json({ animal: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch animal" });
  }
}

async function updateAnimalStatus(req, res) {
  try {
    const { adoption_status } = req.body;
    const result = await pool.query(
      `UPDATE animals SET adoption_status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [adoption_status, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Animal not found" });
    }
    res.json({ animal: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update animal" });
  }
}

module.exports = { createAnimal, getAnimals, getAnimalById, updateAnimalStatus };