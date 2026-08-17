import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const timeAgo = (date) => {
  const diffMs = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const ActiveUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActive = async () => {
      try {
        const { data } = await api.get("/players/active");
        setUsers(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchActive();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-1">Active Users</h1>
      <p className="text-gray-500 mb-8">People online now or recently active on PlayNearby.</p>

      {loading ? (
        <p className="text-gray-400">Loading active users...</p>
      ) : users.length === 0 ? (
        <p className="text-gray-400">No recently active users right now. Check back soon!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {users.map((u) => (
            <Link
              to={`/players/${u._id}`}
              key={u._id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-5 flex flex-col gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-lg">
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                      u.isOnline ? "bg-secondary" : "bg-gray-300"
                    }`}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-cardText">{u.name}</h3>
                  <p className="text-xs text-gray-400">
                    {u.isOnline ? "Online now" : `Active ${timeAgo(u.lastActive)}`}
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-500">{u.location || "Location not set"}</p>

              <div className="flex flex-wrap gap-2">
                {(u.favoriteGames || []).slice(0, 3).map((game) => (
                  <span key={game} className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full">
                    {game}
                  </span>
                ))}
              </div>

              {u.availability?.timeSlot && (
                <p className="text-xs text-gray-400">Available: {u.availability.timeSlot}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActiveUsers;
