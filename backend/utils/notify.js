const Notification = require("../models/Notification");

// Creates a notification document. Centralized so every controller
// generates consistent notification records.
const createNotification = async ({
  user,
  type,
  title,
  message = "",
  relatedUser,
  relatedRequest,
  relatedCommunity,
  game = "",
  location = "",
  status = "info",
}) => {
  try {
    await Notification.create({
      user,
      type,
      title,
      message,
      relatedUser,
      relatedRequest,
      relatedCommunity,
      game,
      location,
      status,
    });
  } catch (error) {
    // Notification failures should never break the main request flow
    console.error("Failed to create notification:", error.message);
  }
};

module.exports = { createNotification };
