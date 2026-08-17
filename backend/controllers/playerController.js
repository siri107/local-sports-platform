const User = require("../models/User");

// Filters other members by game, location text match, and skill level.
// @query  game, location, skillLevel
const searchPlayers = async (req, res) => {
  try {
    const { game, location, skillLevel } = req.query;

    const filter = {
      _id: { $ne: req.user._id },
      role: "user",
      isActive: true,
    };

    if (game) {
      filter.favoriteGames = { $in: [game] };
    }

    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    if (skillLevel) {
      filter.skillLevel = skillLevel;
    }

    const players = await User.find(filter).select("-password");

    res.json(players);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lists members active in the last 24 hours, flagging anyone active in the last 15 minutes as online now.
const getActiveUsers = async (req, res) => {
  try {
    const now = new Date();
    const onlineThreshold = new Date(now.getTime() - 15 * 60 * 1000); // 15 minutes
    const recentThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours

    const users = await User.find({
      _id: { $ne: req.user._id },
      role: "user",
      isActive: true,
      lastActive: { $gte: recentThreshold },
    })
      .select("-password")
      .sort({ lastActive: -1 })
      .limit(50);

    const withStatus = users.map((u) => ({
      ...u.toObject(),
      isOnline: u.lastActive >= onlineThreshold,
    }));

    res.json(withStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { searchPlayers, getActiveUsers };
