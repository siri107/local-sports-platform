import React, { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import api from "../services/api";

const UpcomingGames = () => {
  const { user } = useAuth();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingModal, setRatingModal] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState("");

  const fetchGames = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/requests/upcoming");
      setGames(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleComplete = async (id) => {
    await api.put(`/requests/${id}/complete`);
    setRatingModal(id);
    fetchGames();
  };

  const submitRating = async () => {
    if (!ratingModal) return;
    try {
      await api.post(`/requests/${ratingModal}/rate`, { value: ratingValue, comment: ratingComment });
    } catch (error) {
      console.error(error);
    } finally {
      setRatingModal(null);
      setRatingValue(5);
      setRatingComment("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-1">Upcoming Games</h1>
      <p className="text-gray-500 mb-8">Matches you've confirmed and haven't played yet.</p>

      {loading ? (
        <p className="text-gray-400">Loading upcoming games...</p>
      ) : games.length === 0 ? (
        <p className="text-gray-400">No upcoming games. Send a play request to get started!</p>
      ) : (
        <div className="space-y-4">
          {games.map((g) => {
            const opponent = g.sender._id === user?._id ? g.receiver : g.sender;
            return (
              <div key={g._id} className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex flex-wrap justify-between gap-4">
                  <div>
                    <p className="font-semibold text-cardText">vs {opponent?.name}</p>
                    <p className="text-sm text-gray-500">Mobile: {opponent?.phone || "Not shared"}</p>
                  </div>
                  <span className="text-xs bg-secondary/10 text-secondary px-3 py-1 rounded-full h-fit">
                    {g.game}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs">Venue</p>
                    <p>{g.proposedLocation || "TBD"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Date</p>
                    <p>{g.proposedDate ? new Date(g.proposedDate).toLocaleDateString() : "TBD"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Time</p>
                    <p>{g.proposedTime || "TBD"}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleComplete(g._id)}
                  className="mt-4 bg-primary text-white text-sm px-4 py-2 rounded-lg hover:opacity-90"
                >
                  Mark as Completed
                </button>
              </div>
            );
          })}
        </div>
      )}

      {ratingModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-semibold text-lg mb-4">Rate your opponent</h3>
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setRatingValue(n)}
                  className={`text-2xl ${n <= ratingValue ? "text-accent" : "text-gray-200"}`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              placeholder="Optional comment"
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={submitRating}
                className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-medium hover:opacity-90"
              >
                Submit Rating
              </button>
              <button
                onClick={() => setRatingModal(null)}
                className="flex-1 bg-gray-100 text-cardText py-2 rounded-lg text-sm font-medium hover:bg-gray-200"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingGames;
