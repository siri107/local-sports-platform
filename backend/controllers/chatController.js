const Message = require("../models/Message");
const User = require("../models/User");
const { isUserOnline } = require("../utils/presenceTracker");

// Persists a chat message. Both the REST fallback route and the Socket.IO
// handler call this so a message is stored identically no matter which
// path delivered it.
const saveMessage = async ({ senderId, receiverId, content }) => {
  const trimmed = (content || "").trim();
  if (!trimmed) {
    throw new Error("A message cannot be empty");
  }
  if (senderId.toString() === receiverId.toString()) {
    throw new Error("You cannot message yourself");
  }

  const receiverExists = await User.exists({ _id: receiverId });
  if (!receiverExists) {
    throw new Error("Recipient not found");
  }

  const message = await Message.create({
    sender: senderId,
    receiver: receiverId,
    content: trimmed,
  });

  return message;
};

// GET /api/chat/conversations
// Builds the inbox list: one row per person you've exchanged messages with,
// showing their latest message and how many of their messages you haven't read.
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const threads = await Message.aggregate([
      { $match: { $or: [{ sender: userId }, { receiver: userId }] } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ["$sender", userId] }, "$receiver", "$sender"],
          },
          lastMessage: { $first: "$content" },
          lastMessageAt: { $first: "$createdAt" },
          lastSenderId: { $first: "$sender" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$receiver", userId] }, { $eq: ["$isRead", false] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { lastMessageAt: -1 } },
    ]);

    const partnerIds = threads.map((t) => t._id);
    const partners = await User.find({ _id: { $in: partnerIds } }).select("name location");
    const partnerMap = new Map(partners.map((p) => [p._id.toString(), p]));

    const conversations = threads
      .filter((t) => partnerMap.has(t._id.toString()))
      .map((t) => {
        const partner = partnerMap.get(t._id.toString());
        return {
          partnerId: partner._id,
          partnerName: partner.name,
          partnerLocation: partner.location,
          lastMessage: t.lastMessage,
          lastMessageAt: t.lastMessageAt,
          wasLastMessageMine: t.lastSenderId.toString() === userId.toString(),
          unreadCount: t.unreadCount,
          isOnline: isUserOnline(partner._id),
        };
      });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/chat/unread-count
const getUnreadMessageCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({ receiver: req.user._id, isRead: false });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/chat/:userId
// Full history with one other person, oldest first. Marks their messages
// to you as read the moment you open the thread.
const getMessagesWithUser = async (req, res) => {
  try {
    const otherUserId = req.params.userId;

    const otherUser = await User.findById(otherUserId).select("name location");
    if (!otherUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: otherUserId },
        { sender: otherUserId, receiver: req.user._id },
      ],
    }).sort({ createdAt: 1 });

    await Message.updateMany(
      { sender: otherUserId, receiver: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({
      partner: {
        _id: otherUser._id,
        name: otherUser.name,
        location: otherUser.location,
        isOnline: isUserOnline(otherUser._id),
      },
      messages,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/chat/:userId
// REST fallback for sending a message (used if the socket connection ever
// drops but the person is still on the page). The primary send path is
// the Socket.IO "send_message" event, which calls saveMessage() directly.
const sendMessageRest = async (req, res) => {
  try {
    const message = await saveMessage({
      senderId: req.user._id,
      receiverId: req.params.userId,
      content: req.body.content,
    });
    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  saveMessage,
  getConversations,
  getUnreadMessageCount,
  getMessagesWithUser,
  sendMessageRest,
};
