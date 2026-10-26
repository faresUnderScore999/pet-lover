const express = require("express");
const router = express.Router();
const { authenticateToken, optionalAuth } = require("../middleware/auth");
const { createIncident, getIncidents, getIncidentById, updateIncidentStatus } = require("../controllers/incidentController");

router.post("/", authenticateToken, createIncident);
router.get("/", optionalAuth, getIncidents);
router.get("/:id", optionalAuth, getIncidentById);
router.patch("/:id/status", authenticateToken, updateIncidentStatus);

module.exports = router;