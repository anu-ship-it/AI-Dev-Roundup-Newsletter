// db.js — Handles connecting to MongoDB Atlas
// We put this in its own file so every part of the app
// shares a single connection instead of opening many

const mongoose = require("mongoose");

// Load environment variables from .env file
require("dotenv").config();

async function connectDB() {
  try {
    // mongoose.connect() opens a connection to MongoDB Atlas
    // useNewUrlParser and useUnifiedTopology are recommended options
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME,
    });

    console.log("✅ Connected to MongoDB Atlas");
  } catch (error) {
    // If connection fails (wrong password, network issue, etc.)
    // log the error and exit — no point running the scraper with no DB
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

async function disconnectDB() {
  await mongoose.disconnect();
  console.log("🔌 Disconnected from MongoDB");
}

module.exports = { connectDB, disconnectDB };