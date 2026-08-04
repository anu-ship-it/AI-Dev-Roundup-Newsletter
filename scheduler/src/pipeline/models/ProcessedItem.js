// ProcessedItem.js — Schema for AI-processed newsletter items
//
// After the AI pipeline runs, surviving items land here.
// This is what the email builder reads to assemble the newsletter.
// Raw scrapes stay in RawItem — we never modify them.

const mongoose = require("mongoose");

const ProcessedItemSchema = new mongoose.Schema(
  {
    // Reference back to the original RawItem
    // So we can always trace where an item came from
    rawItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RawItem",
      required: true,
    },

    // Copied from RawItem for convenience (email builder won't need to join)
    source: { type: String, required: true },
    title: { type: String, required: true },
    url: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },

    // ── AI-generated fields ──

    // The relevance score GPT-4o-mini assigned (1-10)
    relevanceScore: { type: Number, required: true },

    // The 3-line summary GPT-4o wrote
    summary: { type: String, required: true },

    // Which newsletter edition this item belongs to
    // Format: "2024-W28" (year-week number)
    // Null until the email builder assigns it
    newsletterEdition: { type: String, default: null },

    // Has this item been included in a sent newsletter?
    sent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ProcessedItemSchema.index({ newsletterEdition: 1 });
ProcessedItemSchema.index({ sent: 1 });

module.exports = mongoose.models.ProcessedItem || mongoose.model("ProcessedItem", ProcessedItemSchema, "processeditems");