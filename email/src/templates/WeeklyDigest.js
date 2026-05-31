function buildWeeklyDigest({ items = [], edition = "", newsletterName = "AI Dev Roundup", subscriberName = "", unsubscribeToken = "" }) {
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  const unsubscribeUrl = `${baseUrl}/api/unsubscribe?token=${unsubscribeToken}`;

  const itemsHtml = items.map((item, index) => `
    <tr>
      <td style="padding: 0 40px;">
        <p style="color:#94a3b8;font-size:11px;font-weight:600;letter-spacing:0.08em;margin:0 0 6px;text-transform:uppercase;">
          ${item.source.replace(/_/g, " ").toUpperCase()} · Score ${item.relevanceScore}/10
        </p>
        <h2 style="font-size:18px;font-weight:600;margin:0 0 10px;line-height:1.3;">
          <a href="${item.url}" style="color:#0f172a;text-decoration:none;">${item.title}</a>
        </h2>
        <p style="color:#475569;font-size:14px;line-height:22px;margin:0 0 12px;white-space:pre-line;">${item.summary}</p>
        <a href="${item.url}" style="color:#3b82f6;font-size:13px;font-weight:500;text-decoration:none;">Read more →</a>
        ${index < items.length - 1 ? '<hr style="border:none;border-top:1px solid #f1f5f9;margin:24px 0;" />' : ""}
      </td>
    </tr>
  `).join("");

  const greeting = subscriberName ? `Hi ${subscriberName.split(" ")[0]},` : "Hi,";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${newsletterName}</title>
</head>
<body style="background-color:#f6f9fc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 0;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#0f172a;padding:32px 40px;border-radius:8px 8px 0 0;">
              <h1 style="color:#ffffff;font-size:28px;font-weight:700;margin:0 0 8px;">${newsletterName}</h1>
              <p style="color:#94a3b8;font-size:14px;margin:0;">Edition ${edition} · ${items.length} items</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:24px 40px 0;">
              <p style="color:#475569;font-size:15px;line-height:24px;margin:0 0 8px;">${greeting}</p>
              <p style="color:#475569;font-size:15px;line-height:24px;margin:0;">
                Here's your weekly roundup of the highest-signal AI and developer content — curated and summarized for engineers building real products.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
            </td>
          </tr>

          <!-- Items -->
          ${itemsHtml}

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:0 40px 40px;">
              <p style="color:#94a3b8;font-size:12px;line-height:18px;margin:0 0 4px;">
                You're receiving this because you subscribed to ${newsletterName}.
              </p>
              <p style="color:#94a3b8;font-size:12px;line-height:18px;margin:0 0 4px;">
                Built with Node.js, MongoDB, Groq, and Resend.
              </p>
              <p style="color:#94a3b8;font-size:12px;line-height:18px;margin:0 0 4px;">
                Built by Anoop Kumar.
              </p>
              <p style="color:#94a3b8;font-size:12px;line-height:18px;margin:8px 0 0;">
                <a href="${unsubscribeUrl}" style="color:#94a3b8;text-decoration:underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

module.exports = { buildWeeklyDigest };