import React from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const games = [
  { name: "Chess", emoji: "♟️" },
  { name: "Carrom", emoji: "🎯" },
  { name: "Badminton", emoji: "🏸" },
  { name: "Table Tennis", emoji: "🏓" },
  { name: "Cricket", emoji: "🏏" },
  { name: "Football", emoji: "⚽" },
  { name: "Volleyball", emoji: "🏐" },
];

const Home = () => {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-cardText mb-4">
            Find Your Next Play Partner, <span className="text-primary">Nearby</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Discover people around you who love chess, carrom, badminton, cricket, and more.
            Connect, coordinate, and play — no more empty WhatsApp groups.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to={user ? "/find-players" : "/register"}
              className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition"
            >
              {user ? "Find Players" : "Get Started"}
            </Link>
            <Link
              to="/about"
              className="bg-white border border-gray-200 text-cardText px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Games */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-semibold text-center mb-8">Popular Games</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {games.map((game) => (
            <div
              key={game.name}
              className="bg-white rounded-xl shadow-sm p-6 text-center hover:shadow-md transition"
            >
              <div className="text-3xl mb-2">{game.emoji}</div>
              <p className="font-medium text-cardText">{game.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-10">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {[
              { step: "1", title: "Create Profile", desc: "Set your favorite games and skill level" },
              { step: "2", title: "Set Availability", desc: "Choose your preferred time and location" },
              { step: "3", title: "Find Players", desc: "Search nearby players who match your interests" },
              { step: "4", title: "Play Together", desc: "Send a request, get matched, and play" },
            ].map((item) => (
              <div key={item.step}>
                <div className="w-10 h-10 mx-auto rounded-full bg-primary text-white flex items-center justify-center font-semibold mb-3">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
