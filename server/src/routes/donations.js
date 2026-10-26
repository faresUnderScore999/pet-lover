const express = require("express");
const router = express.Router();
const { authenticateToken, optionalAuth } = require("../middleware/auth");
const { createDonation, getDonations } = require("../controllers/donationController");

router.post("/", authenticateToken, createDonation);
router.get("/", optionalAuth, getDonations);

module.exports = router;