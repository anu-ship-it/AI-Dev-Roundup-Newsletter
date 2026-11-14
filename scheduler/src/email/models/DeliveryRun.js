// ============================================================
// FILE:    scheduler/src/email/models/DeliveryRun.js
// STAGE:   STAGE 3 of 3 - EMAIL (data model)
// ACTION:  NEW FILE - create scheduler/src/email/models/DeliveryRun.js
// PURPOSE: One record per email run. The Monday verify check reads this to prove mail went out.
// ============================================================

// One document per email-stage run. The verify stage reads this to prove mail really went out.
const mongoose = require("mongoose");

const DeliveryRunSchema = new mongoose.Schema(
  {
    edition: String,
    status: { type: String, enum: ["ok", "partial", "failed", "no_items"] },
    itemsIncluded: { type: Number, default: 0 },
    subscribersTotal: { type: Number, default: 0 },
    alreadySent: { type: Number, default: 0 },
    reached: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    errors: [{ email: String, error: String }],
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.DeliveryRun || mongoose.model("DeliveryRun", DeliveryRunSchema, "deliveryruns");