require("dotenv").config();
const { Resend } = require("resend");
const { buildWeeklyDigest } = require("./templates/WeeklyDigest");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendNewsletter(items, edition, subscriber) {
  const newsletterName = process.env.NEWSLETTER_NAME || "AI Dev Roundup";

  const html = buildWeeklyDigest({
    items,
    edition,
    newsletterName,
    subscriberName: subscriber.name,
    unsubscribeToken: subscriber.unsubscribeToken,
  });

  const { data, error } = await resend.emails.send({
    from: process.env.FROM_EMAIL,
    to: subscriber.email,
    subject: `${newsletterName} — ${edition} (${items.length} picks)`,
    html,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }

  return data.id;
}

module.exports = { sendNewsletter };