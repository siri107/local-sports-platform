const User = require("../models/User");
const Game = require("../models/Game");
const PlayRequest = require("../models/PlayRequest");
const Community = require("../models/Community");
const CommunityPost = require("../models/CommunityPost");

// Returns every registered account so an admin can review the member list.
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Permanently removes a member's account and all their stored data.
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await user.deleteOne();
    res.json({ message: "User removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Flips a member's isActive flag — a reversible suspension short of deleting them outright.
const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.role === "admin") {
      return res.status(400).json({ message: "Cannot block another admin" });
    }
    user.isActive = !user.isActive;
    await user.save();
    res.json({
      message: user.isActive ? "User unblocked" : "User blocked",
      isActive: user.isActive,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lists every community on the platform for the admin moderation screen.
const getAllCommunitiesAdmin = async (req, res) => {
  try {
    const communities = await Community.find()
      .populate("creator", "name email")
      .sort({ createdAt: -1 });
    res.json(communities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Removes a community, its discussion posts, and clears it from every member's profile.
const deleteCommunityAdmin = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }
    await CommunityPost.deleteMany({ community: community._id });
    await User.updateMany(
      { communities: community._id },
      { $pull: { communities: community._id } }
    );
    await community.deleteOne();
    res.json({ message: "Community and its posts removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Pulls every post in a community so an admin can review it for moderation.
const getCommunityPostsAdmin = async (req, res) => {
  try {
    const posts = await CommunityPost.find({ community: req.params.id })
      .populate("author", "name email")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Removes one discussion post flagged during moderation.
const deletePostAdmin = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    await post.deleteOne();
    res.json({ message: "Post removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Summarizes headline counts (users, games, requests) for the admin overview tab.
const getReports = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalGames = await Game.countDocuments();
    const totalRequests = await PlayRequest.countDocuments();
    const acceptedRequests = await PlayRequest.countDocuments({ status: "accepted" });
    const pendingRequests = await PlayRequest.countDocuments({ status: "pending" });

    res.json({
      totalUsers,
      totalGames,
      totalRequests,
      acceptedRequests,
      pendingRequests,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  deleteUser,
  toggleBlockUser,
  getAllCommunitiesAdmin,
  deleteCommunityAdmin,
  getCommunityPostsAdmin,
  deletePostAdmin,
  getReports,
};
