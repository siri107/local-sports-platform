import React, { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import api from "../services/api";

const MatchHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get("/requests/history");
        setHistory(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Match History</h1>

      {loading ? (
        <p className="text-gray-400">Loading match history...</p>
      ) : history.length === 0 ? (
        <p className="text-gray-400">No matches played yet. Go find a partner!</p>
      ) : (
        <div className="space-y-4">
          {history.map((match) => {
            const opponent =
              match.sender?._id === user?._id ? match.receiver : match.sender;
            return (
              <div key={match._id} className="bg-white rounded-xl shadow-sm p-5 flex justify-between items-center flex-wrap gap-3">
                <div>
                  <p className="font-semibold text-cardText">vs {opponent?.name}</p>
                  <p className="text-sm text-gray-500">Game: {match.game}</p>
                </div>
                <span className="text-xs bg-secondary/10 text-secondary px-3 py-1 rounded-full capitalize">
                  {match.status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MatchHistory;
