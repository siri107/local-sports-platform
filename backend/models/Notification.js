const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      // recipient of the notification
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "play_request",
        "request_accepted",
        "request_declined",
        "request_cancelled",
        "community_invite",
        "game_reminder",
        "system",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      default: "",
    },
    relatedUser: {
      // the other user involved (sender/opponent), for display purposes
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    relatedRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PlayRequest",
    },
    relatedCommunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
    },
    game: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    status: {
      // mirrors the state of the related item, for quick display
      type: String,
      enum: ["pending", "accepted", "declined", "cancelled", "info"],
      default: "info",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
