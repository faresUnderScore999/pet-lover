require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

const corsOrigins = (process.env.CLIENT_URL || "*").split(",").map(s => s.trim());
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/incidents", require("./routes/incidents"));
app.use("/api/safety", require("./routes/safety"));
app.use("/api/animals", require("./routes/animals"));
app.use("/api/tnr", require("./routes/tnr"));
app.use("/api/donations", require("./routes/donations"));
app.use("/api/cleanup", require("./routes/cleanup"));
app.use("/api/wastebins", require("./routes/wastebins"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;