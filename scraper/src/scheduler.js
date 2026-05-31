// scheduler.js — Weekly pipeline orchestrator
//
// Runs the full pipeline on a cron schedule:
// Scraper → AI Pipeline → Email
//
// Uses node-cron for scheduling.
// Each step runs as a child process so failures are isolated —
// if the scraper crashes, we log it and stop. No partial sends.

require("dotenv").config();
const cron = require("node-cron");
const { execSync } = require("child_process");
const path = require("path");

// Root of the monorepo - one level up from scraper /
const ROOT = path.resolve(__dirname, "../../");

function log(msg) {
    const ts = new Date().toISOString();
    console.log(`[${ts}] ${msg}`);
}

function runService(name, dir) {
    log(`▶ Starting ${name}...`);
    try {
        // execSync runs the command synchronously - we wait for it to finish
        // before moving to the next step. stdio: "inherit" pipes output to
        // our terminal so we can see what each service is doing.
        execSync("node src/index.js", {
            cmd: dir,
            studio: "inherit",
            timeout: 5 * 60 * 1000, // 5 minute timeout per service
        });
        log(`✅ ${name} completed`);
        return true;
    } catch (err) {
        log(`❌ ${name} failed: ${err.message}`);
        return false;
    }
}

async function runPileline() {
    log("═══════════════════════════════════════");
  log("🚀 Weekly AI Dev Roundup pipeline starting");
  log("═══════════════════════════════════════");

  const start = Date.now();

//   Step 1 : Scraper
const scraperOk = runService("Scraper", path.join(ROOT,"scraper"));
if (!scraperOk) {
    log("⛔ Pipeline stopped — scraper failed");
    return;
}

// Step 2 : AI Pipeline
const pipelineOk = runService("AI Pipeline", path.join(ROOT, "ai-pipeline"));
  if (!pipelineOk) {
    log("⛔ Pipeline stopped — AI pipeline failed");
    return;
  }

//   Step 3: Email
const emmailOk = runService("Email Service", path.join(ROOT, "email"));
  if (!emailOK) {
    log("⛔ Pipeline stopped — email service failed");
    return;
  }

  const duration = ((Date.now() - start) / 1000).toFixed(1);
  log("═══════════════════════════════════════");
  log(`✅ Pipeline complete in ${duration}s`);
  log("═══════════════════════════════════════");
}

// ── Schedule ──────────────────────────────────────────────
// Cron format: second minute hour day month weekday
// "0 8 * * 0" = every Sunday at 8:00am
// 
// To test immediately without waiting for Sunday.
// set RUN_NOW=true in your environment:
// RUN_NOW=true node src/scheduler.js

if (process.env.RUN_NOW === "true") {
    log("RUN_NOW=true - running pipeline immediately");
    runPileline();
} else {
    log("⏰ Scheduler started — pipeline runs every Sunday at 8:00am");
    log("   Set RUN_NOW=true to trigger immediately");

    cron.schedule("0 8 * * 0", () => {
        runPileline();
    }, {
        timezone: "Asia/Kolkata", // IST - change to your timezone
    });
}