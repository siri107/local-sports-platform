import React from "react";
import { Link } from "react-router-dom";

const skillColors = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-orange-100 text-orange-700",
  advanced: "bg-blue-100 text-blue-700",
};

const PlayerCard = ({ player, onSendRequest }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-5 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-lg">
          {player.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <Link to={`/players/${player._id}`} className="font-semibold text-cardText hover:text-primary">
            {player.name}
          </Link>
          <p className="text-sm text-gray-500">{player.location || "Location not set"}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(player.favoriteGames || []).map((game) => (
          <span
            key={game}
            className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full"
          >
            {game}
          </span>
        ))}
      </div>

      <span
        className={`text-xs w-fit px-2 py-1 rounded-full capitalize ${
          skillColors[player.skillLevel] || "bg-gray-100 text-gray-600"
        }`}
      >
        {player.skillLevel}
      </span>

      <button
        onClick={() => onSendRequest(player)}
        className="mt-2 bg-primary text-white py-2 rounded-lg hover:opacity-90 transition text-sm font-medium"
      >
        Send Play Request
      </button>
    </div>
  );
};

export default PlayerCard;
