// Tracks which users currently have at least one open Socket.IO connection.
// A single person can have several tabs/devices open at once, so each user
// maps to a *set* of socket ids rather than a single one — the user only
// counts as "offline" once every one of their sockets has disconnected.
const connectionsByUser = new Map();

const markOnline = (userId, socketId) => {
  const key = userId.toString();
  if (!connectionsByUser.has(key)) {
    connectionsByUser.set(key, new Set());
  }
  connectionsByUser.get(key).add(socketId);
  return connectionsByUser.get(key).size === 1; // true if this is their first connection
};

const markOffline = (userId, socketId) => {
  const key = userId.toString();
  const sockets = connectionsByUser.get(key);
  if (!sockets) return false;
  sockets.delete(socketId);
  if (sockets.size === 0) {
    connectionsByUser.delete(key);
    return true; // true if they have no more open connections at all
  }
  return false;
};

const isUserOnline = (userId) => connectionsByUser.has(userId.toString());

const getOnlineUserIds = () => Array.from(connectionsByUser.keys());

module.exports = { markOnline, markOffline, isUserOnline, getOnlineUserIds };
