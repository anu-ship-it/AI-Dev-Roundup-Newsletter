// hackerNews.js — Scraper for Hacker News top stories
//
// Uses the official HN Firebase API — no scraping, no rate limits.
// Pulls top 30 stories, filters for ones with URLs (excludes Ask HN, Show HN text posts)
// and high scores (>100 points) to keep signal high.

const axios = require("axios");

const HN_API = "https://hacker-news.firebaseio.com/v0";
const MIN_SCORE = 100;
const MAX_STORIES = 30;

async function scrapeHackerNews() {
  console.log("Scraping Hacker News...");

  // Get top story IDs
  const { data: topIds } = await axios.get(`${HN_API}/topstories.json`, {
    timeout: 10000,
  });

  // Fetch details for top N stories in parallel
  const storyPromises = topIds.slice(0, 60).map((id) =>
    axios
      .get(`${HN_API}/item/${id}.json`, { timeout: 5000 })
      .then((r) => r.data)
      .catch(() => null)
  );

  const stories = await Promise.all(storyPromises);

  const items = stories
    .filter(
      (s) =>
        s &&
        s.url &&           // has external URL
        s.score >= MIN_SCORE && // high enough signal
        s.type === "story" &&
        !s.deleted &&
        !s.dead
    )
    .slice(0, MAX_STORIES)
    .map((s) => ({
      source: "hacker_news",
      title: s.title,
      url: s.url,
      description: `${s.score} points · ${s.descendants || 0} comments`,
      metadata: {
        score: s.score,
        comments: s.descendants || 0,
        author: s.by,
        hnUrl: `https://news.ycombinator.com/item?id=${s.id}`,
      },
    }));

  console.log(`Hacker News: found ${items.length} stories`);
  return items;
}

module.exports = { scrapeHackerNews };
