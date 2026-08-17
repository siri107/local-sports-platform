import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { GAME_OPTIONS } from "../constants/games";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState(null);
  const [games, setGames] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");
  const [newGame, setNewGame] = useState({ name: "", category: "indoor", description: "" });
  const [gameError, setGameError] = useState("");

  const fetchCore = async () => {
    try {
      setLoading(true);
      const [usersRes, reportsRes] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/reports"),
      ]);
      setUsers(usersRes.data);
      setReports(reportsRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGames = async () => {
    const { data } = await api.get("/games");
    setGames(data);
  };

  const fetchCommunities = async () => {
    const { data } = await api.get("/admin/communities");
    setCommunities(data);
  };

  useEffect(() => {
    fetchCore();
  }, []);

  useEffect(() => {
    if (tab === "games" && games.length === 0) fetchGames();
    if (tab === "communities" && communities.length === 0) fetchCommunities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to permanently remove this user?")) return;
    await api.delete(`/admin/users/${id}`);
    fetchCore();
  };

  const handleToggleBlock = async (id) => {
    await api.put(`/admin/users/${id}/toggle-block`);
    fetchCore();
  };

  const handleCreateGame = async (e) => {
    e.preventDefault();
    setGameError("");
    if (!newGame.name) {
      setGameError("Game name is required");
      return;
    }
    try {
      await api.post("/games", newGame);
      setNewGame({ name: "", category: "indoor", description: "" });
      fetchGames();
    } catch (error) {
      setGameError(error.response?.data?.message || "Failed to create game");
    }
  };

  const handleDeleteGame = async (id) => {
    if (!window.confirm("Delete this game from the platform?")) return;
    await api.delete(`/games/${id}`);
    fetchGames();
  };

  const handleViewPosts = async (community) => {
    setSelectedCommunity(community);
    const { data } = await api.get(`/admin/communities/${community._id}/posts`);
    setCommunityPosts(data);
  };

  const handleDeleteCommunity = async (id) => {
    if (!window.confirm("Delete this community and all its posts? This cannot be undone.")) return;
    await api.delete(`/admin/communities/${id}`);
    if (selectedCommunity?._id === id) setSelectedCommunity(null);
    fetchCommunities();
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Delete this post?")) return;
    await api.delete(`/admin/communities/posts/${postId}`);
    setCommunityPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  if (loading) return <p className="text-center py-20 text-gray-400">Loading admin dashboard...</p>;

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "users", label: "Manage Users" },
    { key: "games", label: "Manage Games" },
    { key: "communities", label: "Communities" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>

      <div className="flex flex-wrap gap-3 mb-8">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              tab === t.key ? "bg-primary text-white" : "bg-white text-gray-500"
            }`}
          >
            {t.label}
          </button>
        ))}
        <Link
          to="/analytics"
          className="px-4 py-2 rounded-lg text-sm font-medium bg-accent text-white hover:opacity-90"
        >
          Full Analytics Dashboard →
        </Link>
      </div>

      {/* Overview */}
      {tab === "overview" && reports && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Total Users", value: reports.totalUsers },
            { label: "Total Games", value: reports.totalGames },
            { label: "Total Requests", value: reports.totalRequests },
            { label: "Accepted", value: reports.acceptedRequests },
            { label: "Pending", value: reports.pendingRequests },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm p-5 text-center">
              <p className="text-2xl font-semibold text-primary">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Manage Users */}
      {tab === "users" && (
        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Joined</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b last:border-0">
                  <td className="p-4">{u.name}</td>
                  <td className="p-4">{u.email}</td>
                  <td className="p-4 capitalize">{u.role}</td>
                  <td className="p-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        u.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                      }`}
                    >
                      {u.isActive ? "Active" : "Blocked"}
                    </span>
                  </td>
                  <td className="p-4">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 flex gap-3">
                    {u.role !== "admin" && (
                      <>
                        <button
                          onClick={() => handleToggleBlock(u._id)}
                          className="text-xs text-primary hover:underline"
                        >
                          {u.isActive ? "Block" : "Unblock"}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="text-red-500 hover:underline text-xs"
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Manage Games */}
      {tab === "games" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-5 h-fit">
            <h3 className="font-semibold mb-3">Add a Game</h3>
            {gameError && <p className="bg-red-50 text-red-600 text-xs p-2 rounded-lg mb-3">{gameError}</p>}
            <form onSubmit={handleCreateGame} className="space-y-3">
              <input
                type="text"
                placeholder="Game name"
                value={newGame.name}
                onChange={(e) => setNewGame({ ...newGame, name: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                list="existing-games"
              />
              <datalist id="existing-games">
                {GAME_OPTIONS.map((g) => (
                  <option key={g} value={g} />
                ))}
              </datalist>
              <select
                value={newGame.category}
                onChange={(e) => setNewGame({ ...newGame, category: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="indoor">Indoor</option>
                <option value="outdoor">Outdoor</option>
              </select>
              <textarea
                placeholder="Description (optional)"
                value={newGame.description}
                onChange={(e) => setNewGame({ ...newGame, description: e.target.value })}
                rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="w-full bg-primary text-white py-2 rounded-lg text-sm font-medium hover:opacity-90"
              >
                Add Game
              </button>
            </form>
          </div>

          <div className="md:col-span-2 bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold mb-3">All Games ({games.length})</h3>
            {games.length === 0 ? (
              <p className="text-sm text-gray-400">No games yet. Run the seed script or add one manually.</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {games.map((g) => (
                  <div key={g._id} className="flex justify-between items-center border-b last:border-0 py-2">
                    <div>
                      <p className="text-sm font-medium">{g.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{g.category}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteGame(g._id)}
                      className="text-red-500 hover:underline text-xs"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Communities moderation */}
      {tab === "communities" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold mb-3">All Communities ({communities.length})</h3>
            {communities.length === 0 ? (
              <p className="text-sm text-gray-400">No communities created yet.</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {communities.map((c) => (
                  <div key={c._id} className="border-b last:border-0 py-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-xs text-gray-400">
                          {c.sportType} • {c.members?.length || 0} members • by {c.creator?.name}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleViewPosts(c)}
                          className="text-xs text-primary hover:underline"
                        >
                          View Posts
                        </button>
                        <button
                          onClick={() => handleDeleteCommunity(c._id)}
                          className="text-red-500 hover:underline text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold mb-3">
              {selectedCommunity ? `Posts in ${selectedCommunity.name}` : "Select a community to moderate posts"}
            </h3>
            {selectedCommunity && communityPosts.length === 0 && (
              <p className="text-sm text-gray-400">No posts in this community.</p>
            )}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {communityPosts.map((p) => (
                <div key={p._id} className="border-b last:border-0 pb-3">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-medium">{p.author?.name}</p>
                    <button
                      onClick={() => handleDeletePost(p._id)}
                      className="text-red-500 hover:underline text-xs"
                    >
                      Delete
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{p.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
