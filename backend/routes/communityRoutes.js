const express = require("express");
const router = express.Router();
const {
  getCommunities,
  getCommunityById,
  createCommunity,
  joinCommunity,
  leaveCommunity,
  addEvent,
  getPosts,
  createPost,
  toggleLikePost,
} = require("../controllers/communityController");
const { protect } = require("../middleware/auth");

router.get("/", protect, getCommunities);
router.post("/", protect, createCommunity);
router.get("/:id", protect, getCommunityById);
router.put("/:id/join", protect, joinCommunity);
router.put("/:id/leave", protect, leaveCommunity);
router.post("/:id/events", protect, addEvent);
router.get("/:id/posts", protect, getPosts);
router.post("/:id/posts", protect, createPost);
router.put("/posts/:postId/like", protect, toggleLikePost);

module.exports = router;
