// scheduler/src/index.js — Master orchestrator
//
// Runs the full pipeline in sequence:
// 1. Scraper — pulls GitHub Trending into MongoDB
// 2. AI Pipeline — dedup, rank, summarize
// 3. Email — sends newsletter to all subscribers
//
// Each step is imported directly — no child processes.
// If any step fails, the pipeline stops and logs the error.

require("dotenv").config();

const { runScraper } = require("./scraper/run");
const { runPipeline } = require("./pipeline/run");
const { runEmail } = require("./email/run");

function log(msg) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${msg}`);
}

async function main() {
  const start = Date.now();

  log("═══════════════════════════════════════════");
  log("AI Dev Roundup — Weekly Pipeline Starting");
  log("═══════════════════════════════════════════");

  // Step 1: Scraper
  log("STEP 1: Starting scraper...");
  try {
    await runScraper();
    log("STEP 1: Scraper completed");
  } catch (err) {
    log(`STEP 1 FAILED: ${err.message}`);
    log("Pipeline stopped — scraper failed");
    process.exit(1);
  }

  // Step 2: AI Pipeline
  log("STEP 2: Starting AI pipeline...");
  try {
    await runPipeline();
    log("STEP 2: AI pipeline completed");
  } catch (err) {
    log(`STEP 2 FAILED: ${err.message}`);
    log("Pipeline stopped — AI pipeline failed");
    process.exit(1);
  }

  // Step 3: Email
  log("STEP 3: Starting email service...");
  try {
    await runEmail();
    log("STEP 3: Email service completed");
  } catch (err) {
    log(`STEP 3 FAILED: ${err.message}`);
    log("Pipeline stopped — email service failed");
    process.exit(1);
  }

  const duration = ((Date.now() - start) / 1000).toFixed(1);
  log("═══════════════════════════════════════════");
  log(`Pipeline complete in ${duration}s`);
  log("═══════════════════════════════════════════");
}

main();
