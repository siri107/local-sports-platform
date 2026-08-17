const express = require("express");
const router = express.Router();
const { getGames, createGame, deleteGame } = require("../controllers/gameController");
const { protect, adminOnly } = require("../middleware/auth");

router.get("/", getGames);
router.post("/", protect, adminOnly, createGame);
router.delete("/:id", protect, adminOnly, deleteGame);

module.exports = router;
