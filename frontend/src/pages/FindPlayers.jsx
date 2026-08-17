import React, { useEffect, useState } from "react";
import api from "../services/api";
import PlayerCard from "../components/PlayerCard";
import { GAME_OPTIONS } from "../constants/games";

const FindPlayers = () => {
  const [players, setPlayers] = useState([]);
  const [filters, setFilters] = useState({ game: "", location: "", skillLevel: "" });
  const [loading, setLoading] = useState(true);
  const [modalPlayer, setModalPlayer] = useState(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [sendStatus, setSendStatus] = useState("");

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.game) params.game = filters.game;
      if (filters.location) params.location = filters.location;
      if (filters.skillLevel) params.skillLevel = filters.skillLevel;

      const { data } = await api.get("/players/search", { params });
      setPlayers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchPlayers();
  };

  const openRequestModal = (player) => {
    setModalPlayer(player);
    setRequestMessage("");
    setSendStatus("");
  };

  const sendRequest = async () => {
    try {
      await api.post("/requests", {
        receiver: modalPlayer._id,
        game: filters.game || modalPlayer.favoriteGames?.[0] || "General",
        message: requestMessage,
      });
      setSendStatus("Request sent successfully!");
      setTimeout(() => setModalPlayer(null), 1200);
    } catch (error) {
      setSendStatus(error.response?.data?.message || "Failed to send request");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Find Nearby Players</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Filter sidebar */}
        <form
          onSubmit={handleFilterSubmit}
          className="bg-white rounded-xl shadow-sm p-5 h-fit space-y-4"
        >
          <h3 className="font-semibold text-cardText">Filters</h3>

          <div>
            <label className="block text-sm font-medium mb-1">Game</label>
            <select
              value={filters.game}
              onChange={(e) => setFilters({ ...filters, game: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All Games</option>
              {GAME_OPTIONS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              type="text"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              placeholder="e.g. Kondapur"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Skill Level</label>
            <select
              value={filters.skillLevel}
              onChange={(e) => setFilters({ ...filters, skillLevel: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Any</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded-lg text-sm font-medium hover:opacity-90"
          >
            Apply Filters
          </button>
        </form>

        {/* Results */}
        <div className="md:col-span-3">
          {loading ? (
            <p className="text-gray-400">Searching players...</p>
          ) : players.length === 0 ? (
            <p className="text-gray-400">No players found matching your filters.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {players.map((player) => (
                <PlayerCard key={player._id} player={player} onSendRequest={openRequestModal} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Request Modal */}
      {modalPlayer && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="font-semibold text-lg mb-4">
              Send Play Request to {modalPlayer.name}
            </h3>
            {sendStatus && (
              <p className="text-sm bg-blue-50 text-primary p-2 rounded-lg mb-3">{sendStatus}</p>
            )}
            <textarea
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              rows={3}
              placeholder="Add a short message (optional)"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={sendRequest}
                className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-medium hover:opacity-90"
              >
                Send Request
              </button>
              <button
                onClick={() => setModalPlayer(null)}
                className="flex-1 bg-gray-100 text-cardText py-2 rounded-lg text-sm font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FindPlayers;
