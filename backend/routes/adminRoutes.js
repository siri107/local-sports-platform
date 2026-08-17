const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  deleteUser,
  toggleBlockUser,
  getAllCommunitiesAdmin,
  deleteCommunityAdmin,
  getCommunityPostsAdmin,
  deletePostAdmin,
  getReports,
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/auth");

router.get("/users", protect, adminOnly, getAllUsers);
router.delete("/users/:id", protect, adminOnly, deleteUser);
router.put("/users/:id/toggle-block", protect, adminOnly, toggleBlockUser);

router.get("/communities", protect, adminOnly, getAllCommunitiesAdmin);
router.delete("/communities/:id", protect, adminOnly, deleteCommunityAdmin);
router.get("/communities/:id/posts", protect, adminOnly, getCommunityPostsAdmin);
router.delete("/communities/posts/:postId", protect, adminOnly, deletePostAdmin);

router.get("/reports", protect, adminOnly, getReports);

module.exports = router;
