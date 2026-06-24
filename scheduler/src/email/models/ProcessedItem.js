// ProcessedItem.js — Read-only reference to processed newsletter items
// The email service reads from this collection, never writes new items.
// It only flips 'sent: true' after a successful send.

const mongoose = require("mongoose");

const ProcessedItemSchema = new mongoose.Schema(
  {
    rawItemId: { type: mongoose.Schema.Types.ObjectId, ref: "RawItem" },
    source: { type: String },
    title: { type: String },
    url: { type: String },
    description: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed },
    relevanceScore: { type: Number },
    summary: { type: String },
    newsletterEdition: { type: String },
    sent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.models.ProcessedItem || mongoose.model("ProcessedItem", ProcessedItemSchema);