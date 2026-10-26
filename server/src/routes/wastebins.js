const express = require("express");
const router = express.Router();
const { authenticateToken, optionalAuth } = require("../middleware/auth");
const { createWasteBin, getWasteBins } = require("../controllers/wastebinController");

router.post("/", authenticateToken, createWasteBin);
router.get("/", optionalAuth, getWasteBins);

module.exports = router;