function buildWeeklyDigest({ items = [], edition = "", newsletterName = "AI Dev Roundup", subscriberName = "", unsubscribeToken = "" }) {
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  const unsubscribeUrl = `${baseUrl}/api/unsubscribe?token=${unsubscribeToken}`;
  const weekLabel = edition.replace("W", "Week ");
  const greeting = subscriberName ? `Hi ${subscriberName.split(" ")[0]},` : "Hi,";

  const signalColors = {
    "Tool": "#2563eb",
    "Research": "#7c3aed",
    "Tutorial": "#059669",
    "Release": "#dc2626",
    "Repo": "#000000",
  };

  const itemsHtml = items.map((item) => {
    const summaryLines = item.summary || "";
    const signalMatch = summaryLines.match(/\*\*Signal\*\*:\s*(.+)/);
    const signal = signalMatch ? signalMatch[1].trim() : "Repo";
    const signalColor = signalColors[signal] || "#000000";

    const cleanSummary = summaryLines
      .replace(/\*\*What\*\*:\s*/g, "")
      .replace(/\*\*Why it matters\*\*:\s*/g, "")
      .replace(/\*\*Signal\*\*:.+/g, "")
      .replace(/\n{2,}/g, "\n")
      .trim();

    return `
    <tr>
      <td style="padding:32px 48px;border-bottom:1px solid #f1f5f9;">
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td>
              <span style="display:inline-block;background:${signalColor};color:#ffffff;font-size:9px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;padding:3px 8px;">${signal}</span>
              <span style="font-size:11px;color:#94a3b8;margin-left:10px;letter-spacing:0.05em;">${item.source.replace(/_/g, " ").toUpperCase()} &middot; ${item.relevanceScore}/10</span>
            </td>
          </tr>
        </table>
        <h2 style="font-size:18px;font-weight:700;color:#000000;margin:12px 0 10px;line-height:1.3;font-family:Georgia,serif;">
          <a href="${item.url}" style="color:#000000;text-decoration:none;">${item.title}</a>
        </h2>
        <p style="font-size:14px;color:#475569;line-height:1.7;margin:0 0 16px;white-space:pre-line;">${cleanSummary}</p>
        <a href="${item.url}" style="font-size:12px;font-weight:600;color:#000000;text-decoration:none;border-bottom:1px solid #000000;padding-bottom:1px;letter-spacing:0.03em;">READ MORE &rarr;</a>
      </td>
    </tr>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${newsletterName}</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e2e8f0;">

          <!-- TOP ACCENT BAR -->
          <tr><td style="background:#000000;height:4px;font-size:0;line-height:0;">&nbsp;</td></tr>

          <!-- HEADER -->
          <tr>
            <td style="padding:32px 48px 24px;border-bottom:1px solid #000000;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#94a3b8;margin:0 0 6px;">by Anoop &middot; ${weekLabel}</p>
                    <h1 style="font-size:28px;font-weight:800;color:#000000;margin:0;letter-spacing:-0.02em;font-family:Georgia,serif;">AI Dev Roundup</h1>
                  </td>
                  <td align="right" valign="bottom">
                    <span style="font-size:11px;color:#94a3b8;">${items.length} picks this week</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- GREETING -->
          <tr>
            <td style="padding:28px 48px 0;">
              <p style="font-size:15px;color:#0f172a;margin:0 0 6px;font-weight:600;">${greeting}</p>
              <p style="font-size:14px;color:#64748b;line-height:1.6;margin:0;">
                No opinion pieces. No hype. No "top 10 AI tools" lists.<br>
                Just the ${items.length} things worth your time this week.
              </p>
            </td>
          </tr>

          <!-- DIVIDER -->
          <tr>
            <td style="padding:24px 48px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="border-top:2px solid #000000;font-size:0;">&nbsp;</td></tr>
              </table>
            </td>
          </tr>

          <!-- ITEMS -->
          ${itemsHtml}

          <!-- FOOTER -->
          <tr>
            <td style="padding:32px 48px;background:#000000;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="font-size:13px;font-weight:700;color:#ffffff;margin:0 0 4px;letter-spacing:-0.01em;">AI Dev Roundup</p>
                    <p style="font-size:11px;color:#64748b;margin:0;">Curated by Anoop &middot; Every Sunday</p>
                  </td>
                  <td align="right" valign="middle">
                    <a href="${unsubscribeUrl}" style="font-size:11px;color:#64748b;text-decoration:underline;">Unsubscribe</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

        <p style="font-size:11px;color:#94a3b8;text-align:center;margin:16px 0 0;">
          Built with Node.js &middot; MongoDB &middot; Groq &middot; Resend &middot; AWS
        </p>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

module.exports = { buildWeeklyDigest };
