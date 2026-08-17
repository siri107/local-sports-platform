const PlayRequest = require("../models/PlayRequest");
const User = require("../models/User");
const { createNotification } = require("../utils/notify");

// Creates a play request and notifies the recipient.
const sendRequest = async (req, res) => {
  try {
    const { receiver, game, message, proposedLocation, proposedDate, proposedTime } = req.body;

    if (!receiver || !game) {
      return res.status(400).json({ message: "Receiver and game are required" });
    }

    if (receiver === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot send a request to yourself" });
    }

    const request = await PlayRequest.create({
      sender: req.user._id,
      receiver,
      game,
      message,
      proposedLocation,
      proposedDate,
      proposedTime,
    });

    await createNotification({
      user: receiver,
      type: "play_request",
      title: `New play request from ${req.user.name}`,
      message: message || `${req.user.name} wants to play ${game} with you`,
      relatedUser: req.user._id,
      relatedRequest: request._id,
      game,
      location: proposedLocation,
      status: "pending",
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Returns both directions of the current user's play requests.
const getMyRequests = async (req, res) => {
  try {
    const received = await PlayRequest.find({ receiver: req.user._id })
      .populate("sender", "name email location skillLevel phone")
      .sort({ createdAt: -1 });

    const sent = await PlayRequest.find({ sender: req.user._id })
      .populate("receiver", "name email location skillLevel phone")
      .sort({ createdAt: -1 });

    res.json({ received, sent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Marks a request accepted, which is what makes it show up as an upcoming game for both people.
const acceptRequest = async (req, res) => {
  try {
    const request = await PlayRequest.findById(req.params.id).populate("sender", "name");

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this request" });
    }

    request.status = "accepted";
    await request.save();

    await createNotification({
      user: request.sender._id,
      type: "request_accepted",
      title: `${req.user.name} accepted your play request`,
      message: `Your ${request.game} request was accepted. It's now in your Upcoming Games.`,
      relatedUser: req.user._id,
      relatedRequest: request._id,
      game: request.game,
      location: request.proposedLocation,
      status: "accepted",
    });

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Marks a request rejected and lets the sender know.
const rejectRequest = async (req, res) => {
  try {
    const request = await PlayRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this request" });
    }

    request.status = "rejected";
    await request.save();

    await createNotification({
      user: request.sender,
      type: "request_declined",
      title: `${req.user.name} declined your play request`,
      message: `Your ${request.game} request was declined.`,
      relatedUser: req.user._id,
      relatedRequest: request._id,
      game: request.game,
      location: request.proposedLocation,
      status: "declined",
    });

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lets the original sender withdraw a request that hasn't been answered yet.
const cancelRequest = async (req, res) => {
  try {
    const request = await PlayRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to cancel this request" });
    }

    request.status = "cancelled";
    await request.save();

    await createNotification({
      user: request.receiver,
      type: "request_cancelled",
      title: `${req.user.name} cancelled a play request`,
      message: `The ${request.game} request was cancelled by the sender.`,
      relatedUser: req.user._id,
      relatedRequest: request._id,
      game: request.game,
      location: request.proposedLocation,
      status: "cancelled",
    });

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Closes out an accepted match and bumps both players' games-played count.
const completeRequest = async (req, res) => {
  try {
    const request = await PlayRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    const isParticipant =
      request.sender.toString() === req.user._id.toString() ||
      request.receiver.toString() === req.user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({ message: "Not authorized to update this request" });
    }

    if (request.status !== "accepted") {
      return res.status(400).json({ message: "Only accepted games can be marked completed" });
    }

    request.status = "completed";
    request.completedAt = new Date();
    await request.save();

    // Increment gamesPlayedCount for both participants
    await User.findByIdAndUpdate(request.sender, { $inc: { gamesPlayedCount: 1 } });
    await User.findByIdAndUpdate(request.receiver, { $inc: { gamesPlayedCount: 1 } });

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lists the current user's confirmed matches that haven't been played yet.
const getUpcomingGames = async (req, res) => {
  try {
    const upcoming = await PlayRequest.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
      status: "accepted",
    })
      .populate("sender", "name phone")
      .populate("receiver", "name phone")
      .sort({ proposedDate: 1 });

    res.json(upcoming);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lists the current user's finished matches, most recent first.
const getMatchHistory = async (req, res) => {
  try {
    const history = await PlayRequest.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
      status: "completed",
    })
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .sort({ completedAt: -1 });

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Records a post-match rating and recalculates the opponent's running average.
const rateOpponent = async (req, res) => {
  try {
    const { value, comment } = req.body;
    const request = await PlayRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    if (request.status !== "completed") {
      return res.status(400).json({ message: "You can only rate completed matches" });
    }

    const isSender = request.sender.toString() === req.user._id.toString();
    const isReceiver = request.receiver.toString() === req.user._id.toString();
    if (!isSender && !isReceiver) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const opponentId = isSender ? request.receiver : request.sender;
    const opponent = await User.findById(opponentId);

    opponent.ratingsReceived.push({ from: req.user._id, value, comment });
    const total = opponent.ratingsReceived.reduce((sum, r) => sum + r.value, 0);
    opponent.rating.count = opponent.ratingsReceived.length;
    opponent.rating.average = Number((total / opponent.rating.count).toFixed(1));
    await opponent.save();

    res.json({ message: "Rating submitted", rating: opponent.rating });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendRequest,
  getMyRequests,
  acceptRequest,
  rejectRequest,
  cancelRequest,
  completeRequest,
  getUpcomingGames,
  getMatchHistory,
  rateOpponent,
};
