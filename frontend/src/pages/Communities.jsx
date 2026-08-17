import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import useAuth from "../hooks/useAuth";
import { GAME_OPTIONS } from "../constants/games";

const Communities = () => {
  const { user } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "", sportType: "" });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      const { data } = await api.get("/communities", { params });
      setCommunities(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCommunities();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.name || !formData.sportType) {
      setError("Community name and sport type are required");
      return;
    }
    try {
      setCreating(true);
      await api.post("/communities", formData);
      setShowCreate(false);
      setFormData({ name: "", description: "", sportType: "" });
      fetchCommunities();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create community");
    } finally {
      setCreating(false);
    }
  };

  const isMember = (community) =>
    community.members?.some((m) => (m._id || m) === user?._id);

  const handleJoin = async (id) => {
    await api.put(`/communities/${id}/join`);
    fetchCommunities();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Communities</h1>
          <p className="text-gray-500">Join groups based on sports you love and connect locally.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:opacity-90"
        >
          + Create Community
        </button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8 max-w-md">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search communities..."
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="bg-white border border-gray-200 px-4 rounded-lg text-sm font-medium hover:bg-gray-50"
        >
          Search
        </button>
      </form>

      {loading ? (
        <p className="text-gray-400">Loading communities...</p>
      ) : communities.length === 0 ? (
        <p className="text-gray-400">No communities found. Be the first to create one!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {communities.map((c) => (
            <div key={c._id} className="bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <Link to={`/communities/${c._id}`} className="font-semibold text-cardText hover:text-primary">
                    {c.name}
                  </Link>
                  <p className="text-xs text-gray-400">{c.sportType}</p>
                </div>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  {c.memberCount ?? c.members?.length ?? 0} members
                </span>
              </div>
              <p className="text-sm text-gray-500 line-clamp-2">{c.description || "No description yet."}</p>
              <div className="flex gap-2 mt-auto">
                <Link
                  to={`/communities/${c._id}`}
                  className="flex-1 text-center bg-gray-100 text-cardText py-2 rounded-lg text-sm font-medium hover:bg-gray-200"
                >
                  View
                </Link>
                {!isMember(c) && (
                  <button
                    onClick={() => handleJoin(c._id)}
                    className="flex-1 bg-secondary text-white py-2 rounded-lg text-sm font-medium hover:opacity-90"
                  >
                    Join
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="font-semibold text-lg mb-4">Create a Community</h3>
            {error && <p className="bg-red-50 text-red-600 text-sm p-2 rounded-lg mb-3">{error}</p>}
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  placeholder="e.g. Kondapur Badminton Club"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sport / Interest</label>
                <select
                  value={formData.sportType}
                  onChange={(e) => setFormData({ ...formData, sportType: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Select a sport</option>
                  {GAME_OPTIONS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  placeholder="What's this community about?"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-60"
                >
                  {creating ? "Creating..." : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 bg-gray-100 text-cardText py-2 rounded-lg text-sm font-medium hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Communities;
