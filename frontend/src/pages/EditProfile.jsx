import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { GAME_OPTIONS, DAYS } from "../constants/games";

const EditProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    favoriteGames: [],
    skillLevel: "beginner",
    availability: { days: [], timeSlot: "" },
    location: "",
    playingLocationType: "",
    bio: "",
    achievements: [],
  });
  const [achievementInput, setAchievementInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/users/profile");
        setFormData({
          name: data.name || "",
          phone: data.phone || "",
          favoriteGames: data.favoriteGames || [],
          skillLevel: data.skillLevel || "beginner",
          availability: data.availability || { days: [], timeSlot: "" },
          location: data.location || "",
          playingLocationType: data.playingLocationType || "",
          bio: data.bio || "",
          achievements: data.achievements || [],
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const toggleGame = (game) => {
    setFormData((prev) => ({
      ...prev,
      favoriteGames: prev.favoriteGames.includes(game)
        ? prev.favoriteGames.filter((g) => g !== game)
        : [...prev.favoriteGames, game],
    }));
  };

  const toggleDay = (day) => {
    setFormData((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        days: prev.availability.days.includes(day)
          ? prev.availability.days.filter((d) => d !== day)
          : [...prev.availability.days, day],
      },
    }));
  };

  const addAchievement = () => {
    const trimmed = achievementInput.trim();
    if (!trimmed) return;
    setFormData((prev) => ({
      ...prev,
      achievements: [...prev.achievements, trimmed],
    }));
    setAchievementInput("");
  };

  const removeAchievement = (index) => {
    setFormData((prev) => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      setSaving(true);
      await api.put("/users/profile", formData);
      setMessage("Profile updated successfully!");
      setTimeout(() => navigate("/profile"), 1000);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center py-20 text-gray-400">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h2 className="text-xl font-semibold mb-6">Edit Profile</h2>

        {message && (
          <p className="bg-blue-50 text-primary text-sm p-3 rounded-lg mb-4">{message}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Jubilee Hills, Hyderabad"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Playing Location Type</label>
            <select
              value={formData.playingLocationType}
              onChange={(e) => setFormData({ ...formData, playingLocationType: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select</option>
              <option value="home">Home</option>
              <option value="society_clubhouse">Society Clubhouse</option>
              <option value="local_ground">Local Ground</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Skill Level</label>
            <select
              value={formData.skillLevel}
              onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Favorite Games</label>
            <div className="flex flex-wrap gap-2">
              {GAME_OPTIONS.map((game) => (
                <button
                  type="button"
                  key={game}
                  onClick={() => toggleGame(game)}
                  className={`text-sm px-3 py-1.5 rounded-full border transition ${
                    formData.favoriteGames.includes(game)
                      ? "bg-primary text-white border-primary"
                      : "border-gray-200 text-gray-600 hover:border-primary"
                  }`}
                >
                  {game}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Available Days</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => (
                <button
                  type="button"
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`text-sm px-3 py-1.5 rounded-full border transition ${
                    formData.availability.days.includes(day)
                      ? "bg-secondary text-white border-secondary"
                      : "border-gray-200 text-gray-600 hover:border-secondary"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Preferred Time Slot</label>
            <input
              type="text"
              value={formData.availability.timeSlot}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  availability: { ...formData.availability, timeSlot: e.target.value },
                })
              }
              placeholder="e.g. Evenings 6-8 PM"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Achievements</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={achievementInput}
                onChange={(e) => setAchievementInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addAchievement();
                  }
                }}
                placeholder="e.g. Won society badminton tournament 2025"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              <button
                type="button"
                onClick={addAchievement}
                className="bg-secondary text-white px-4 rounded-lg text-sm font-medium hover:opacity-90"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.achievements.map((a, i) => (
                <span
                  key={i}
                  className="text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-full flex items-center gap-2"
                >
                  {a}
                  <button
                    type="button"
                    onClick={() => removeAchievement(i)}
                    className="text-accent hover:text-red-500"
                    aria-label={`Remove achievement: ${a}`}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Tell others a bit about yourself..."
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
