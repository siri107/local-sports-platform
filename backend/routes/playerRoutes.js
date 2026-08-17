const express = require("express");
const router = express.Router();
const { searchPlayers, getActiveUsers } = require("../controllers/playerController");
const { protect } = require("../middleware/auth");

router.get("/search", protect, searchPlayers);
router.get("/active", protect, getActiveUsers);

module.exports = router;
