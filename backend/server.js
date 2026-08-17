const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const { authLimiter, generalLimiter } = require("./middleware/rateLimiter");
const { registerChatHandlers } = require("./socket/chatSocket");

// Route imports
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const gameRoutes = require("./routes/gameRoutes");
const playerRoutes = require("./routes/playerRoutes");
const requestRoutes = require("./routes/requestRoutes");
const adminRoutes = require("./routes/adminRoutes");
const communityRoutes = require("./routes/communityRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const chatRoutes = require("./routes/chatRoutes");

dotenv.config();
connectDB();

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL || "https://local-sports-platform.vercel.app" , methods: ["GET", "POST"]},
});
registerChatHandlers(io);

// Middleware
// crossOriginResourcePolicy is relaxed because the frontend is deployed on a
// different origin than this API (e.g. Vercel calling a Render backend) —
// the default "same-origin" policy would otherwise block those responses.
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: process.env.CLIENT_URL || "https://local-sports-platform.vercel.app" }));
app.use(express.json());
app.use(mongoSanitize()); // strips any $ or . keys from req.body/query/params
app.use(generalLimiter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Local Sports Platform API is running" });
});

// Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/chat", chatRoutes);

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Socket.IO ready for real-time chat connections");
});
