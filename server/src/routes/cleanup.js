const express = require("express");
const router = express.Router();
const { authenticateToken, optionalAuth } = require("../middleware/auth");
const { createCleanUp, getCleanUps } = require("../controllers/cleanupController");

router.post("/", authenticateToken, createCleanUp);
router.get("/", optionalAuth, getCleanUps);

module.exports = router;