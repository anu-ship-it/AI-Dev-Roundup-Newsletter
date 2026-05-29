// sender.js — Resend email sending
//
// Takes processed items, renders the React Email template to HTML,
// and sends via Resend's API.
// Resend handles deliverability, SPF/DKIM, and bounce tracking.

require("dotenv").config();
const { Resend } = require("resend");
const { renderAsync } = require("@react-email/components");
const React = require("react");
const { WeeklyDigest } = require("./templates/WeeklyDigest.jsx");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendNewsletter(items, edition) {
    console.log(`\n📧 Preparing email for edition ${edition}...`);
    console.log(`   Items to include: ${items.length}`);

    // Step 1: Render the React Email template to HTML string
    // renderAsync converts JSX -> valid HTML that works in all email clients
    const html = await renderAsync(
        React.createElement(WeeklyDigest, {
            items,
            edition,
            newsletterName: process.env.NEWSLETTER_NAME || "AI Dev Roundup",
        })
    );

    console.log(`    Template rendered ✓`);

    // Step 2: Send via Resend
    const { data, error } = await resend.emails.send({
        from: process.env.FROM_EMAIL,
        to: process.env.TO_EMAIL,
        subject: `${process.env.NEWSLETTER_NAME || "AI Dev Roundup"} - ${edition} (${items.length} picks)`,
        html,
    });

    if (error) {
        throw new Error(`Resend error: ${error.message}`);
    }

    console.log(`   ✅ Email sent successfully! ID: ${data.id}`);
    return data.id;
}

module.exports = { sendNewsletter };
