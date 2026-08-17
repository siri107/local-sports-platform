import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import useAuth from "../hooks/useAuth";

const PublicProfile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState("");
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestData, setRequestData] = useState({ game: "", message: "" });

  useEffect(() => {
    // If viewing your own profile via this route, redirect to the editable one
    if (currentUser && id === currentUser._id) {
      navigate("/profile");
      return;
    }
    const fetchProfile = async () => {
      try {
        const { data } = await api.get(`/users/${id}`);
        setProfile(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, currentUser, navigate]);

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!requestData.game) {
      setSendStatus("Please select a game");
      return;
    }
    try {
      setSending(true);
      await api.post("/requests", { receiver: id, ...requestData });
      setSendStatus("Play request sent!");
      setTimeout(() => setShowRequestForm(false), 1200);
    } catch (error) {
      setSendStatus(error.response?.data?.message || "Failed to send request");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <p className="text-center py-20 text-gray-400">Loading profile...</p>;
  if (!profile) return <p className="text-center py-20 text-gray-400">Profile not found.</p>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-semibold">
              {profile.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{profile.name}</h2>
              <p className="text-gray-500 text-sm">{profile.location || "Location not set"}</p>
              {profile.rating?.count > 0 && (
                <p className="text-sm text-accent mt-1">
                  ★ {profile.rating.average} ({profile.rating.count} ratings)
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              to={`/messages/${profile._id}`}
              className="bg-gray-100 text-cardText px-5 py-2.5 rounded-lg font-medium hover:bg-gray-200 text-sm"
            >
              Message
            </Link>
            <button
              onClick={() => setShowRequestForm(true)}
              className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:opacity-90 text-sm"
            >
              Send Play Request
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-center">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-lg font-semibold text-primary">{profile.completedGamesCount}</p>
            <p className="text-xs text-gray-500">Games Played</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-lg font-semibold text-primary">{profile.upcomingGamesCount}</p>
            <p className="text-xs text-gray-500">Upcoming</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-lg font-semibold text-primary">{profile.communities?.length || 0}</p>
            <p className="text-xs text-gray-500">Communities</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-lg font-semibold text-primary capitalize">{profile.skillLevel}</p>
            <p className="text-xs text-gray-500">Skill Level</p>
          </div>
        </div>

        {profile.bio && (
          <div className="mb-6">
            <p className="text-gray-400 text-sm mb-1">Bio</p>
            <p className="text-sm">{profile.bio}</p>
          </div>
        )}

        <div className="mb-6">
          <p className="text-gray-400 text-sm mb-2">Favorite Games</p>
          <div className="flex flex-wrap gap-2">
            {profile.favoriteGames?.length ? (
              profile.favoriteGames.map((game) => (
                <span key={game} className="bg-secondary/10 text-secondary text-xs px-3 py-1 rounded-full">
                  {game}
                </span>
              ))
            ) : (
              <p className="text-sm text-gray-400">No games listed</p>
            )}
          </div>
        </div>

        {profile.achievements?.length > 0 && (
          <div className="mb-6">
            <p className="text-gray-400 text-sm mb-2">Achievements</p>
            <div className="flex flex-wrap gap-2">
              {profile.achievements.map((a, i) => (
                <span key={i} className="bg-accent/10 text-accent text-xs px-3 py-1 rounded-full">
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {profile.communities?.length > 0 && (
          <div>
            <p className="text-gray-400 text-sm mb-2">Communities</p>
            <div className="flex flex-wrap gap-2">
              {profile.communities.map((c) => (
                <Link
                  key={c._id}
                  to={`/communities/${c._id}`}
                  className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full hover:opacity-80"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {showRequestForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="font-semibold text-lg mb-4">Send Play Request to {profile.name}</h3>
            {sendStatus && (
              <p className="text-sm bg-blue-50 text-primary p-2 rounded-lg mb-3">{sendStatus}</p>
            )}
            <form onSubmit={handleSendRequest} className="space-y-3">
              <select
                value={requestData.game}
                onChange={(e) => setRequestData({ ...requestData, game: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Select a game</option>
                {profile.favoriteGames?.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <textarea
                value={requestData.message}
                onChange={(e) => setRequestData({ ...requestData, message: e.target.value })}
                rows={3}
                placeholder="Add a short message (optional)"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={sending}
                  className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-60"
                >
                  Send Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
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

export default PublicProfile;
