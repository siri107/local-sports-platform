const mongoose = require("mongoose");

// A single direct message between two platform members. Conversation threads
// are derived at query time from the sender/receiver pair rather than stored
// as a separate collection, since a two-party chat needs no extra grouping
// entity here.
const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "A message cannot be empty"],
      trim: true,
      maxlength: 2000,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Speeds up "give me every message between these two people" lookups,
// which is the query this feature runs constantly.
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, isRead: 1 });

module.exports = mongoose.model("Message", messageSchema);
