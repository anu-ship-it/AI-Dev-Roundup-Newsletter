// Subscriber.js — Read-only reference to the subscribers collection
const mongoose = require("mongoose");

const SubscriberSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    unsubscribeToken: { type: String },
    subscribed: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Subscriber ||
  mongoose.model("Subscriber", SubscriberSchema);