const express = require("express");
const router = express.Router();
const {
  sendRequest,
  getMyRequests,
  acceptRequest,
  rejectRequest,
  cancelRequest,
  completeRequest,
  getUpcomingGames,
  getMatchHistory,
  rateOpponent,
} = require("../controllers/requestController");
const { protect } = require("../middleware/auth");

router.post("/", protect, sendRequest);
router.get("/", protect, getMyRequests);
router.get("/upcoming", protect, getUpcomingGames);
router.get("/history", protect, getMatchHistory);
router.put("/:id/accept", protect, acceptRequest);
router.put("/:id/reject", protect, rejectRequest);
router.put("/:id/cancel", protect, cancelRequest);
router.put("/:id/complete", protect, completeRequest);
router.post("/:id/rate", protect, rateOpponent);

module.exports = router;
