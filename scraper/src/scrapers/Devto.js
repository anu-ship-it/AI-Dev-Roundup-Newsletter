// devto.js — Scraper for Dev.to articles
//
// Uses Dev.to's public API (no key needed for read access).
// Pulls articles tagged with AI-relevant tags published in the last week.
// Filters by reaction count to keep only high-quality content.

const axios = require("axios");

const DEVTO_API = "https://dev.to/api/articles";
const MIN_REACTIONS = 20;
const TAGS = ["ai", "machinelearning", "llm", "openai", "python"];

async function scrapeDevTo() {
  console.log("Scraping Dev.to...");

  const allItems = [];
  const seenUrls = new Set();

  // Fetch articles for each tag
  for (const tag of TAGS) {
    try {
      const { data } = await axios.get(DEVTO_API, {
        params: {
          tag,
          per_page: 10,
          top: 7, // top articles from last 7 days
        },
        timeout: 10000,
        headers: {
          "User-Agent": "AI-Dev-Roundup-Newsletter/1.0",
        },
      });

      for (const article of data) {
        // Skip duplicates across tags
        if (seenUrls.has(article.url)) continue;
        if (article.positive_reactions_count < MIN_REACTIONS) continue;

        seenUrls.add(article.url);

        allItems.push({
          source: "devto",
          title: article.title,
          url: article.url,
          description: article.description || article.title,
          metadata: {
            reactions: article.positive_reactions_count,
            comments: article.comments_count,
            author: article.user?.name || "Unknown",
            readingTime: article.reading_time_minutes,
            tags: article.tag_list,
            publishedAt: article.published_at,
          },
        });
      }

      // Small delay between tag requests — be polite to the API
      await new Promise((r) => setTimeout(r, 500));
    } catch (err) {
      console.warn(`Dev.to tag '${tag}' failed: ${err.message}`);
    }
  }

  console.log(`Dev.to: found ${allItems.length} articles`);
  return allItems;
}

module.exports = { scrapeDevTo };
