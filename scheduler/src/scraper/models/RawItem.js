// RawItem.js — The MongoDB "schema" for scraped content
//
// A schema is a blueprint that tells MongoDB what shape
// your data should have. Every scraped item (from GitHub,
// HN, arXiv, etc.) gets stored as a RawItem document.
//
// We keep this "raw" intentionally — no AI processing yet.
// The AI pipeline will read from this collection later.

const mongoose = require("mongoose");

const RawItemSchema = new mongoose.Schema(
  {
    // Where this item came from: "github_trending", "hackernews", etc.
    source: {
      type: String,
      required: true,
    },

    // The title of the repo, article, or post
    title: {
      type: String,
      required: true,
    },

    // The canonical URL — used to detect duplicates
    url: {
      type: String,
      required: true,
      unique: true, // MongoDB will reject duplicates automatically
    },

    // A short description (repo description, article subtitle, etc.)
    description: {
      type: String,
      default: "",
    },

    // Extra metadata — flexible object because each source returns
    // different things (stars for GitHub, points for HN, etc.)
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Has this item been processed by the AI pipeline yet?
    // Starts as false, flipped to true after AI scoring
    processed: {
      type: Boolean,
      default: false,
    },

    // When this item was scraped (auto-set by MongoDB)
    scrapedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // timestamps: true adds createdAt and updatedAt fields automatically
    timestamps: true,
  }
);

// Create an index on 'url' for faster duplicate lookups


// Create an index on 'processed' so the AI pipeline can quickly
// find all unprocessed items
RawItemSchema.index({ processed: 1 });

// Export the model — "RawItem" becomes the collection name "rawitems" in MongoDB
module.exports = mongoose.models.RawItem || mongoose.model("RawItem", RawItemSchema);
