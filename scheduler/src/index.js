// ============================================================
// FILE:    scheduler/src/index.js
// STAGE:   ALL STAGES - entry point (runs scrape / pipeline / email / verify)
// ACTION:  REPLACE the existing scheduler/src/index.js
// PURPOSE: Runs one stage by name so Step Functions can use a single image for every stage.
// NOTE:    Do not edit anything else in scheduler/src for this file to work.
// ============================================================

// index.js — stage runner.
//   node src/index.js scrape | pipeline | email | verify | all
// Step Functions runs this SAME image three times with a different stage each time,
// so there is exactly one copy of the code to maintain and deploy.
// Exit code 0 = stage succeeded. Anything else = stage failed (and alerts fire).

require("dotenv").config();

const stages = {
  scrape: () => require("./scraper/run").runScraper(),
  pipeline: () => require("./pipeline/run").runPipeline(),
  email: () => require("./email/run").runEmail(),
  verify: () => require("./verify/run").runVerify(),
};

const log = (m) => console.log(`[${new Date().toISOString()}] ${m}`);

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
  process.exit(1);
});

async function main() {
  const requested = (process.argv[2] || process.env.STAGE || "all").toLowerCase();
  const plan = requested === "all" ? ["scrape", "pipeline", "email"] : [requested];

  const unknown = plan.find((s) => !stages[s]);
  if (unknown) {
    console.error(`Unknown stage "${unknown}". Use: ${Object.keys(stages).join(", ")}, all`);
    process.exit(2);
  }

  const started = Date.now();
  for (const name of plan) {
    log(`STAGE ${name}: start`);
    try {
      await stages[name]();
      log(`STAGE ${name}: ok`);
    } catch (err) {
      log(`STAGE ${name}: FAILED - ${err.message}`);
      console.error(err.stack);
      process.exit(1);
    }
  }
  log(`Done in ${((Date.now() - started) / 1000).toFixed(1)}s`);
  process.exit(0);
}

main();