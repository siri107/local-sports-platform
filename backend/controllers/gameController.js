const Game = require("../models/Game");

// Returns the full sports/games catalog used across profile setup and search filters.
const getGames = async (req, res) => {
  try {
    const games = await Game.find().sort({ name: 1 });
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Adds a new sport/activity to the platform catalog.
const createGame = async (req, res) => {
  try {
    const { name, category, description, icon } = req.body;

    if (!name || !category) {
      return res.status(400).json({ message: "Name and category are required" });
    }

    const existing = await Game.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Game already exists" });
    }

    const game = await Game.create({ name, category, description, icon });
    res.status(201).json(game);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Removes a sport/activity from the platform catalog.
const deleteGame = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }
    await game.deleteOne();
    res.json({ message: "Game removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getGames, createGame, deleteGame };
