const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const { getProfile, updateProfile, getUserReports, getUserAnimals } = require("../controllers/userController");

router.get("/profile", authenticateToken, getProfile);
router.put("/profile", authenticateToken, updateProfile);
router.get("/reports", authenticateToken, getUserReports);
router.get("/animals", authenticateToken, getUserAnimals);

module.exports = router;