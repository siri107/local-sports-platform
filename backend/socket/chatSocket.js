const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { saveMessage } = require("../controllers/chatController");
const { markOnline, markOffline } = require("../utils/presenceTracker");

// Every socket connection must present the same JWT used for REST calls.
// This keeps chat access gated by the exact same login session, rather
// than inventing a parallel auth mechanism for real-time traffic.
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Authentication token missing"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user || !user.isActive) {
      return next(new Error("Account not authorized for chat"));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error("Invalid or expired session"));
  }
};

const registerChatHandlers = (io) => {
  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();

    // Each user gets a private room named after their own id, so sending
    // a message to "their room" reaches every tab/device they have open
    // without the server needing to track individual socket ids per message.
    socket.join(userId);

    const isFirstConnection = markOnline(userId, socket.id);
    if (isFirstConnection) {
      io.emit("presence_update", { userId, isOnline: true });
    }

    socket.on("send_message", async ({ receiverId, content }, ack) => {
      try {
        const message = await saveMessage({ senderId: userId, receiverId, content });
        io.to(receiverId).emit("receive_message", message);
        io.to(userId).emit("receive_message", message); // echoes to sender's other open tabs
        if (typeof ack === "function") ack({ success: true, message });
      } catch (error) {
        if (typeof ack === "function") ack({ success: false, error: error.message });
      }
    });

    socket.on("typing", ({ receiverId }) => {
      io.to(receiverId).emit("partner_typing", { userId });
    });

    socket.on("stop_typing", ({ receiverId }) => {
      io.to(receiverId).emit("partner_stopped_typing", { userId });
    });

    socket.on("disconnect", () => {
      const wasLastConnection = markOffline(userId, socket.id);
      if (wasLastConnection) {
        io.emit("presence_update", { userId, isOnline: false });
      }
    });
  });
};

module.exports = { registerChatHandlers };
