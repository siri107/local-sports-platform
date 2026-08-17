const Community = require("../models/Community");
const CommunityPost = require("../models/CommunityPost");
const User = require("../models/User");
const { createNotification } = require("../utils/notify");

// Lists communities, optionally narrowed by sport or a name search.
const getCommunities = async (req, res) => {
  try {
    const { sportType, search } = req.query;
    const filter = {};
    if (sportType) filter.sportType = sportType;
    if (search) filter.name = { $regex: search, $options: "i" };

    const communities = await Community.find(filter)
      .populate("creator", "name")
      .sort({ createdAt: -1 });

    res.json(communities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Loads one community with its member list and creator populated.
const getCommunityById = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate("creator", "name email")
      .populate("members", "name skillLevel location");

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    res.json(community);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Creates a community and enrolls its creator as the first member.
const createCommunity = async (req, res) => {
  try {
    const { name, description, sportType, coverImage } = req.body;

    if (!name || !sportType) {
      return res.status(400).json({ message: "Name and sport type are required" });
    }

    const existing = await Community.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "A community with this name already exists" });
    }

    const community = await Community.create({
      name,
      description,
      sportType,
      coverImage,
      creator: req.user._id,
      members: [req.user._id],
    });

    await User.findByIdAndUpdate(req.user._id, { $addToSet: { communities: community._id } });

    res.status(201).json(community);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Adds the current user to a community's member list.
const joinCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    if (community.members.some((m) => m.toString() === req.user._id.toString())) {
      return res.status(400).json({ message: "You are already a member of this community" });
    }

    community.members.push(req.user._id);
    await community.save();
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { communities: community._id } });

    res.json({ message: "Joined community successfully", community });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Removes the current user from a community's member list.
const leaveCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    community.members = community.members.filter(
      (m) => m.toString() !== req.user._id.toString()
    );
    await community.save();
    await User.findByIdAndUpdate(req.user._id, { $pull: { communities: community._id } });

    res.json({ message: "Left community successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lets the community's creator post an upcoming event and notifies the other members.
const addEvent = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    if (community.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the community creator can add events" });
    }

    const { title, description, location, date } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Event title is required" });
    }

    community.events.push({ title, description, location, date });
    await community.save();

    // Notify all members about the new event
    await Promise.all(
      community.members
        .filter((m) => m.toString() !== req.user._id.toString())
        .map((memberId) =>
          createNotification({
            user: memberId,
            type: "community_invite",
            title: `New event in ${community.name}`,
            message: title,
            relatedCommunity: community._id,
            status: "info",
          })
        )
    );

    res.status(201).json(community);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Returns a community's discussion feed, newest first.
const getPosts = async (req, res) => {
  try {
    const posts = await CommunityPost.find({ community: req.params.id })
      .populate("author", "name")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Adds a new post to a community's discussion feed (members only).
const createPost = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: "Post content is required" });
    }

    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    if (!community.members.some((m) => m.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: "Join the community to post" });
    }

    const post = await CommunityPost.create({
      community: req.params.id,
      author: req.user._id,
      content,
    });

    const populated = await post.populate("author", "name");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggles the current user's like on a post.
const toggleLikePost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const alreadyLiked = post.likes.some((id) => id.toString() === req.user._id.toString());
    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== req.user._id.toString());
    } else {
      post.likes.push(req.user._id);
    }
    await post.save();

    res.json({ likesCount: post.likes.length, liked: !alreadyLiked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCommunities,
  getCommunityById,
  createCommunity,
  joinCommunity,
  leaveCommunity,
  addEvent,
  getPosts,
  createPost,
  toggleLikePost,
};
