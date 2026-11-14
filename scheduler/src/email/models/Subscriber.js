// ============================================================
// FILE:    scheduler/src/email/models/Subscriber.js
// STAGE:   STAGE 3 of 3 - EMAIL (data model)
// ACTION:  REPLACE the existing scheduler/src/email/models/Subscriber.js
// PURPOSE: Adds the lastSentEdition field so a retry never double-sends.
// ============================================================

const mongoose = require("mongoose");

const SubscriberSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    unsubscribeToken: { type: String },
    subscribed: { type: Boolean, default: true },
    // Last edition this person was successfully sent. Makes the email stage safe to re-run.
    lastSentEdition: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Subscriber || mongoose.model("Subscriber", SubscriberSchema);