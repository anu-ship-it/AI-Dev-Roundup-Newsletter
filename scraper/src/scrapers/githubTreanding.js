// githubTrending.js — Scraper adapter for GitHub Trending
//
// This file is responsible for ONE thing: scraping GitHub Trending
// and returning an array of clean, structured objects.
//
// It knows NOTHING about MongoDB or the AI pipeline.
// That separation is intentional — easy to test, easy to replace.

const axios = require("axios");
const cheerio = require("cheerio");

// The URL we're scraping — daily trending repos, all languages
const GITHUB_TRENDING_URL = "https://github.com/trending?since=daily";

// This is our "adapter interface" — every scraper we build must return
// objects in this same shape so the rest of the pipeline stays simple
function buildRawItem(data) {
  return {
    source: "github_trending",
    title: data.title,
    url: data.url,
    description: data.description,
    metadata: {
      stars: data.stars,
      starsToday: data.starsToday,
      language: data.language,
      forks: data.forks,
      contributors: data.contributors,
    },
  };
}

async function scrapeGithubTrending() {
  console.log("🔍 Scraping GitHub Trending...");

  // axios.get() fetches the raw HTML of the page
  // We mimic a real browser with the User-Agent header —
  // some sites block requests that don't look like a browser
  const response = await axios.get(GITHUB_TRENDING_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html",
    },
    timeout: 15000, // give up after 15 seconds
  });

  // cheerio.load() parses the HTML so we can query it like jQuery
  // $ is the conventional name for the cheerio instance
  const $ = cheerio.load(response.data);

  const items = [];

  // Each trending repo is inside an <article> tag with class "Box-row"
  // $("article.Box-row") selects ALL of them, .each() loops through them
  $("article.Box-row").each((index, element) => {
    try {
      // $(element) wraps the raw DOM element so we can call cheerio methods on it
      const el = $(element);

      // ── Title & URL ──
      // The repo link is an <a> inside an h2 — it looks like "/owner/repo"
      const repoPath = el.find("h2 a").attr("href"); // e.g. "/vercel/next.js"
      if (!repoPath) return; // skip if no link found

      const url = `https://github.com${repoPath}`;

      // The text is "  owner /\n  repo  " so we clean it up
      const rawTitle = el.find("h2 a").text().trim();
      const title = rawTitle.replace(/\s+/g, " ").trim(); // collapse whitespace

      // ── Description ──
      const description = el.find("p.col-9").text().trim() || "";

      // ── Language ──
      // The language badge has a specific span structure
      const language =
        el.find('[itemprop="programmingLanguage"]').text().trim() || "Unknown";

      // ── Stars ──
      // Stars and forks share similar link structures — we pick them by href
      const starsText = el
        .find('a[href$="/stargazers"]')
        .text()
        .trim()
        .replace(/,/g, ""); // remove commas from "1,234"
      const stars = parseInt(starsText) || 0;

      const forksText = el
        .find('a[href$="/forks"]')
        .text()
        .trim()
        .replace(/,/g, "");
      const forks = parseInt(forksText) || 0;

      // ── Stars Today ──
      // "123 stars today" is in a span at the bottom of each card
      const starsTodayText = el
        .find(".float-sm-right")
        .text()
        .trim()
        .replace(/,/g, "");
      const starsToday = parseInt(starsTodayText) || 0;

      // ── Contributors (avatars) ──
      const contributors = el.find(".avatar-user").length;

      items.push(
        buildRawItem({
          title,
          url,
          description,
          stars,
          starsToday,
          forks,
          language,
          contributors,
        })
      );
    } catch (err) {
      // If one repo fails to parse, log it but keep going
      // Don't let one bad item kill the whole scrape
      console.warn(`⚠️  Failed to parse repo at index ${index}:`, err.message);
    }
  });

  console.log(`✅ GitHub Trending: found ${items.length} repos`);
  return items;
}

module.exports = { scrapeGithubTrending };