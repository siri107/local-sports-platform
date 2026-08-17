import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [counts, setCounts] = useState({ completed: 0, upcoming: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, historyRes, upcomingRes] = await Promise.all([
          api.get("/users/profile"),
          api.get("/requests/history"),
          api.get("/requests/upcoming"),
        ]);
        setProfile(profileRes.data);
        setCounts({ completed: historyRes.data.length, upcoming: upcomingRes.data.length });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <p className="text-center py-20 text-gray-400">Loading profile...</p>;
  if (!profile) return <p className="text-center py-20 text-gray-400">Unable to load profile.</p>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-semibold">
            {profile.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{profile.name}</h2>
            <p className="text-gray-500 text-sm">{profile.email}</p>
            {profile.rating?.count > 0 && (
              <p className="text-sm text-accent mt-1">
                ★ {profile.rating.average} ({profile.rating.count} ratings)
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-center">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-lg font-semibold text-primary">{counts.completed}</p>
            <p className="text-xs text-gray-500">Games Played</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-lg font-semibold text-primary">{counts.upcoming}</p>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-6">
          <div>
            <p className="text-gray-400">Phone</p>
            <p className="font-medium">{profile.phone || "Not set"}</p>
          </div>
          <div>
            <p className="text-gray-400">Location</p>
            <p className="font-medium">{profile.location || "Not set"}</p>
          </div>
          <div>
            <p className="text-gray-400">Playing Location Type</p>
            <p className="font-medium capitalize">
              {profile.playingLocationType?.replace("_", " ") || "Not set"}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Availability</p>
            <p className="font-medium">
              {profile.availability?.days?.length ? profile.availability.days.join(", ") : "Not set"}
              {profile.availability?.timeSlot ? ` · ${profile.availability.timeSlot}` : ""}
            </p>
          </div>
        </div>

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
              <p className="text-sm text-gray-400">No games selected yet</p>
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
          <div className="mb-6">
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

        {profile.bio && (
          <div className="mb-6">
            <p className="text-gray-400 text-sm mb-1">Bio</p>
            <p className="text-sm">{profile.bio}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-3 mt-8">
          <Link
            to="/edit-profile"
            className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:opacity-90"
          >
            Edit Profile
          </Link>
          <Link
            to="/upcoming-games"
            className="bg-gray-100 text-cardText px-5 py-2.5 rounded-lg font-medium hover:bg-gray-200"
          >
            Upcoming Games
          </Link>
          <Link
            to="/match-history"
            className="bg-gray-100 text-cardText px-5 py-2.5 rounded-lg font-medium hover:bg-gray-200"
          >
            Match History
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Profile;
