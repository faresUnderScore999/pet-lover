const express = require("express");
const router = express.Router();
const { authenticateToken, optionalAuth } = require("../middleware/auth");
const { createAnimal, getAnimals, getAnimalById, updateAnimalStatus } = require("../controllers/animalController");

router.post("/", authenticateToken, createAnimal);
router.get("/", optionalAuth, getAnimals);
router.get("/:id", optionalAuth, getAnimalById);
router.patch("/:id/status", authenticateToken, updateAnimalStatus);

module.exports = router;