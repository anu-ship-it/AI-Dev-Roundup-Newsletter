// lib/mongodb.ts
// Reuses a single MongoDB connection across all API routes.
// Next.js API routes are serverless — without this pattern,
// every request would open a new connection and exhaust the pool.

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = process.env.DB_NAME || "ai_dev_roundup";

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

// Cache the connection on the global object so hot reloads
// in development don't create multiple connections
declare global {
  var mongoose: { conn: typeof import("mongoose") | null; promise: Promise<typeof import("mongoose")> | null };
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;