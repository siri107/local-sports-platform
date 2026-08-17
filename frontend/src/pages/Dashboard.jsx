import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import api from "../services/api";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ received: 0, sent: 0, history: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/requests");
        const { data: history } = await api.get("/requests/history");
        setStats({
          received: data.received.length,
          sent: data.sent.length,
          history: history.length,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: "Find Players", desc: "Search nearby game partners", path: "/find-players", emoji: "🔍" },
    { label: "Communities", desc: "Join sport-based communities", path: "/communities", emoji: "👥" },
    { label: "Active Users", desc: "See who's online right now", path: "/active-users", emoji: "🟢" },
    { label: "Play Requests", desc: `${stats.received} received / ${stats.sent} sent`, path: "/play-requests", emoji: "📩" },
    { label: "Messages", desc: "Chat directly with other players", path: "/messages", emoji: "💬" },
    { label: "Upcoming Games", desc: "Your confirmed matches", path: "/upcoming-games", emoji: "📅" },
    { label: "Match History", desc: `${stats.history} matches played`, path: "/match-history", emoji: "🏆" },
    { label: "Notifications", desc: "Requests, invites & reminders", path: "/notifications", emoji: "🔔" },
    { label: "Edit Profile", desc: "Update your games & availability", path: "/edit-profile", emoji: "⚙️" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-1">Welcome back, {user?.name} 👋</h1>
      <p className="text-gray-500 mb-8">Here's a quick overview of your activity.</p>

      {loading ? (
        <p className="text-gray-400">Loading dashboard...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {cards.map((card) => (
            <Link
              key={card.path}
              to={card.path}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 flex flex-col gap-2"
            >
              <span className="text-3xl">{card.emoji}</span>
              <h3 className="font-semibold text-cardText">{card.label}</h3>
              <p className="text-sm text-gray-500">{card.desc}</p>
            </Link>
          ))}
        </div>
      )}

      {user?.role === "admin" && (
        <div className="mt-8">
          <Link
            to="/admin"
            className="inline-block bg-accent text-white px-5 py-2.5 rounded-lg font-medium hover:opacity-90"
          >
            Go to Admin Dashboard
          </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
