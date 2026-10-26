require("dotenv").config();
const { Pool } = require("pg");
const { parse } = require("pg-connection-string");

const config = parse(process.env.DATABASE_URL);
config.ssl = { rejectUnauthorized: false };

const pool = new Pool(config);

pool.on("connect", () => {
  console.log("Connected to Neon PostgreSQL");
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

module.exports = { pool };