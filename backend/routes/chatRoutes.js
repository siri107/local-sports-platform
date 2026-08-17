const express = require("express");
const router = express.Router();
const {
  getConversations,
  getUnreadMessageCount,
  getMessagesWithUser,
  sendMessageRest,
} = require("../controllers/chatController");
const { protect } = require("../middleware/auth");

router.get("/conversations", protect, getConversations);
router.get("/unread-count", protect, getUnreadMessageCount);
router.get("/:userId", protect, getMessagesWithUser);
router.post("/:userId", protect, sendMessageRest);

module.exports = router;
