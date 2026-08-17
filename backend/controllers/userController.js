const User = require("../models/User");
const PlayRequest = require("../models/PlayRequest");
const Community = require("../models/Community");

// Returns the current user's own profile, including their community memberships.
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("communities", "name sportType");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Returns another member's public-facing profile plus their games-played/upcoming counts.
const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password -ratingsReceived")
      .populate("communities", "name sportType");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const completedGames = await PlayRequest.countDocuments({
      $or: [{ sender: user._id }, { receiver: user._id }],
      status: "completed",
    });

    const upcomingGames = await PlayRequest.countDocuments({
      $or: [{ sender: user._id }, { receiver: user._id }],
      status: "accepted",
    });

    res.json({ ...user.toObject(), completedGamesCount: completedGames, upcomingGamesCount: upcomingGames });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Applies profile edits, only touching fields that were actually sent.
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const {
      name,
      phone,
      favoriteGames,
      skillLevel,
      availability,
      location,
      playingLocationType,
      bio,
      achievements,
    } = req.body;

    user.name = name ?? user.name;
    user.phone = phone ?? user.phone;
    user.favoriteGames = favoriteGames ?? user.favoriteGames;
    user.skillLevel = skillLevel ?? user.skillLevel;
    user.availability = availability ?? user.availability;
    user.location = location ?? user.location;
    user.playingLocationType = playingLocationType ?? user.playingLocationType;
    user.bio = bio ?? user.bio;
    user.achievements = achievements ?? user.achievements;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      favoriteGames: updatedUser.favoriteGames,
      skillLevel: updatedUser.skillLevel,
      availability: updatedUser.availability,
      location: updatedUser.location,
      playingLocationType: updatedUser.playingLocationType,
      bio: updatedUser.bio,
      achievements: updatedUser.achievements,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProfile, getPublicProfile, updateProfile };
