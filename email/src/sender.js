require("dotenv").config();
const { Resend } = require("resend");
const { buildWeeklyDigest } = require("./templates/WeeklyDigest");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendNewsletter(items, edition) {
  console.log(`\n📧 Preparing email for edition ${edition}...`);
  console.log(`   Items to include: ${items.length}`);

  const html = buildWeeklyDigest({
    items,
    edition,
    newsletterName: process.env.NEWSLETTER_NAME || "AI Dev Roundup",
  });

  console.log(`   Template rendered ✓`);

  const { data, error } = await resend.emails.send({
    from: process.env.FROM_EMAIL,
    to: process.env.TO_EMAIL,
    subject: `${process.env.NEWSLETTER_NAME || "AI Dev Roundup"} — ${edition} (${items.length} picks)`,
    html,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }

  console.log(`   ✅ Email sent successfully! ID: ${data.id}`);
  return data.id;
}

module.exports = { sendNewsletter };