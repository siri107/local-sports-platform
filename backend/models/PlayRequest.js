const mongoose = require("mongoose");

const playRequestSchema = new mongoose.Schema(
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
    game: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      default: "",
    },
    proposedLocation: {
      type: String,
      default: "",
    },
    proposedDate: {
      type: Date,
    },
    proposedTime: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled", "completed"],
      default: "pending",
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PlayRequest", playRequestSchema);
