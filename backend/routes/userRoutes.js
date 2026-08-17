const express = require("express");
const router = express.Router();
const { getProfile, getPublicProfile, updateProfile } = require("../controllers/userController");
const { protect } = require("../middleware/auth");

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.get("/:id", protect, getPublicProfile);

module.exports = router;
