// Run with: node seed/seedGames.js
// Populates the Games collection with the full sports/activities list

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Game = require("../models/Game");

dotenv.config();

const games = [
  { name: "Cricket", category: "outdoor", description: "Bat-and-ball team sport" },
  { name: "Football", category: "outdoor", description: "Team sport played with a ball" },
  { name: "Volleyball", category: "outdoor", description: "Team sport played over a net" },
  { name: "Basketball", category: "outdoor", description: "Team sport, hoop scoring" },
  { name: "Badminton", category: "indoor", description: "Racquet sport, indoor or outdoor court" },
  { name: "Tennis", category: "outdoor", description: "Racquet sport played on a court" },
  { name: "Table Tennis", category: "indoor", description: "Fast-paced paddle sport" },
  { name: "Chess", category: "indoor", description: "Classic strategy board game" },
  { name: "Carrom", category: "indoor", description: "Popular tabletop disc game" },
  { name: "Kabaddi", category: "outdoor", description: "Traditional contact team sport" },
  { name: "Hockey", category: "outdoor", description: "Stick-and-ball team sport" },
  { name: "Pickleball", category: "outdoor", description: "Paddle sport combining tennis and badminton" },
  { name: "Skating", category: "outdoor", description: "Roller or inline skating" },
  { name: "Running", category: "outdoor", description: "Recreational or competitive running" },
  { name: "Cycling", category: "outdoor", description: "Recreational or competitive cycling" },
  { name: "Swimming", category: "outdoor", description: "Pool or open water swimming" },
  { name: "Athletics", category: "outdoor", description: "Track and field events" },
  { name: "Throwball", category: "outdoor", description: "Non-contact team sport, ball thrown over a net" },
  { name: "Handball", category: "outdoor", description: "Team sport played by hand" },
  { name: "Billiards", category: "indoor", description: "Cue sport played on a table" },
  { name: "Snooker", category: "indoor", description: "Cue sport, pockets and coloured balls" },
  { name: "Futsal", category: "indoor", description: "Indoor variant of football" },
  { name: "Bowling", category: "indoor", description: "Ten-pin bowling" },
  { name: "Archery", category: "outdoor", description: "Precision sport with bow and arrow" },
  { name: "Yoga", category: "indoor", description: "Mind-body practice and fitness" },
  { name: "Fitness Groups", category: "indoor", description: "Group workouts and fitness sessions" },
  { name: "Trekking", category: "outdoor", description: "Group hikes and trail walks" },
  { name: "Cards", category: "indoor", description: "Card games for groups" },
];

const seedGames = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    await Game.deleteMany();
    await Game.insertMany(games);

    console.log(`${games.length} games seeded successfully!`);
    process.exit();
  } catch (error) {
    console.error("Error seeding games:", error.message);
    process.exit(1);
  }
};

seedGames();
