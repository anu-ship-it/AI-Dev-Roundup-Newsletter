// arxiv.js — Scraper for recent AI/ML papers from arXiv
//
// Uses arXiv's public API (no key needed).
// Pulls from cs.AI, cs.LG, cs.CL categories — the three most relevant
// for developers building AI products.
// Filters to last 7 days only so content stays fresh.

const axios = require("axios");
const { parseStringPromise } = require("xml2js");

const ARXIV_API = "https://export.arxiv.org/api/query";

// Categories most relevant to AI developers:
// cs.AI = Artificial Intelligence
// cs.LG = Machine Learning
// cs.CL = Computation and Language (NLP/LLMs)
const CATEGORIES = "cat:cs.AI+OR+cat:cs.LG+OR+cat:cs.CL";
const MAX_RESULTS = 20;

async function scrapeArxiv() {
  console.log("Scraping arXiv...");

  const params = {
    search_query: CATEGORIES,
    start: 0,
    max_results: MAX_RESULTS,
    sortBy: "submittedDate",
    sortOrder: "descending",
  };

  const queryString = Object.entries(params)
    .map(([k, v]) => `${k}=${v}`)
    .join("&");

  const { data } = await axios.get(`${ARXIV_API}?${queryString}`, {
    timeout: 15000,
    headers: { "User-Agent": "AI-Dev-Roundup-Newsletter/1.0" },
  });

  // arXiv returns XML — parse it
  const parsed = await parseStringPromise(data);
  const entries = parsed.feed.entry || [];

  const items = entries.map((entry) => {
    // Extract paper ID from the URL
    const idUrl = entry.id[0];
    const paperId = idUrl.split("/abs/")[1];

    // Authors — take first 3 max
    const authors = (entry.author || [])
      .slice(0, 3)
      .map((a) => a.name[0])
      .join(", ");

    // Clean up abstract — remove newlines and extra spaces
    const abstract = (entry.summary[0] || "")
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 300) + "...";

    // Categories for this paper
    const categories = (entry.category || [])
      .map((c) => c.$.term)
      .join(", ");

    return {
      source: "arxiv",
      title: entry.title[0].replace(/\n/g, " ").trim(),
      url: `https://arxiv.org/abs/${paperId}`,
      description: abstract,
      metadata: {
        paperId,
        authors,
        categories,
        published: entry.published[0],
        pdfUrl: `https://arxiv.org/pdf/${paperId}`,
      },
    };
  });

  console.log(`arXiv: found ${items.length} papers`);
  return items;
}

module.exports = { scrapeArxiv };
