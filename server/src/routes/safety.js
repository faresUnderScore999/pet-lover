const express = require("express");
const router = express.Router();
const { authenticateToken, optionalAuth } = require("../middleware/auth");
const { createSafetyFlag, getSafetyFlags } = require("../controllers/safetyController");

router.post("/", authenticateToken, createSafetyFlag);
router.get("/", optionalAuth, getSafetyFlags);

module.exports = router;