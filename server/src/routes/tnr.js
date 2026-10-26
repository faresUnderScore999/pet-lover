const express = require("express");
const router = express.Router();
const { authenticateToken, optionalAuth } = require("../middleware/auth");
const { createTNRCase, getTNRCases, getTNRCaseById, updateTNRStatus } = require("../controllers/tnrController");

router.post("/", authenticateToken, createTNRCase);
router.get("/", optionalAuth, getTNRCases);
router.get("/:id", optionalAuth, getTNRCaseById);
router.patch("/:id", authenticateToken, updateTNRStatus);

module.exports = router;