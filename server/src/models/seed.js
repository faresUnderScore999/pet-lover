const { pool } = require("../db");
const bcrypt = require("bcryptjs");

async function run() {
  try {
    const hash = await bcrypt.hash("Admin123!", 10);
    await pool.query(
      `INSERT INTO users (email, password_hash, role, full_name, city, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
      ["admin@animal.tn", hash, "admin", "System Administrator", "Tunis", true]
    );
    console.log("Admin user seeded: admin@animal.tn / Admin123!");

    // Seed a vet
    const vetHash = await bcrypt.hash("Vet123!", 10);
    await pool.query(
      `INSERT INTO users (email, password_hash, role, full_name, city, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING`,
      ["vet@animal.tn", vetHash, "vet", "Dr. Amina Ben Ali", "Sfax", true]
    );
    console.log("Vet user seeded: vet@animal.tn / Vet123!");

    // Seed an association
    const assocHash = await bcrypt.hash("Assoc123!", 10);
    await pool.query(
      `INSERT INTO users (email, password_hash, role, full_name, city, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING`,
      ["assoc@animal.tn", assocHash, "association", "Tunisia Animal Welfare", "Tunis", true]
    );
    console.log("Association user seeded: assoc@animal.tn / Assoc123!");
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();