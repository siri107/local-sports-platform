import React, { useEffect, useState } from "react";
import api from "../services/api";

const typeLabels = {
  play_request: "New Play Request",
  request_accepted: "Request Accepted",
  request_declined: "Request Declined",
  request_cancelled: "Request Cancelled",
  community_invite: "Community Update",
  game_reminder: "Game Reminder",
  system: "System Notification",
};

const statusColors = {
  pending: "bg-orange-100 text-orange-700",
  accepted: "bg-green-100 text-green-700",
  declined: "bg-red-100 text-red-700",
  cancelled: "bg-gray-200 text-gray-600",
  info: "bg-blue-100 text-blue-700",
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "play_request", label: "Play Requests" },
  { key: "request_accepted", label: "Accepted" },
  { key: "request_declined", label: "Declined" },
  { key: "request_cancelled", label: "Cancelled" },
  { key: "community_invite", label: "Communities" },
  { key: "game_reminder", label: "Reminders" },
  { key: "system", label: "System" },
];

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/notifications");
      setNotifications(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    await api.put("/notifications/read-all");
    fetchNotifications();
  };

  const handleMarkRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
  };

  const filtered = filter === "all" ? notifications : notifications.filter((n) => n.type === filter);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold">Notifications & History</h1>
        <button
          onClick={handleMarkAllRead}
          className="text-sm text-primary hover:underline"
        >
          Mark all as read
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${
              filter === f.key
                ? "bg-primary text-white border-primary"
                : "border-gray-200 text-gray-500 hover:border-primary"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-400">Loading notifications...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-400">No notifications here yet.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.isRead && handleMarkRead(n._id)}
              className={`bg-white rounded-xl shadow-sm p-5 cursor-pointer transition ${
                !n.isRead ? "border-l-4 border-primary" : ""
              }`}
            >
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <p className="text-xs text-gray-400 mb-1">{typeLabels[n.type] || n.type}</p>
                  <p className="font-semibold text-cardText">{n.title}</p>
                  {n.message && <p className="text-sm text-gray-500 mt-1">{n.message}</p>}
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                    {n.relatedUser?.name && <span>User: {n.relatedUser.name}</span>}
                    {n.game && <span>Game: {n.game}</span>}
                    {n.location && <span>Location: {n.location}</span>}
                    <span>{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full capitalize ${statusColors[n.status]}`}>
                  {n.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
