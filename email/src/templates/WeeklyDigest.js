// WeeklyDigest.jsx — React Email template
//
// React Email lets you write email templates in JSX.
// It compiles to plain HTML that renders correctly across all email clients.
// No CSS-in-JS issues, no Gmail clipping, no Outlook breakage.

const React = require("react");
const {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
  Preview,
  Heading,
} = require("@react-email/components");

function WeeklyDigest({ items = [], edition = "", newsletterName = "AI Dev Roundup" }) {
  const previewText = `${items.length} high-signal items for developers building with AI`;

  return React.createElement(
    Html,
    null,
    React.createElement(Head, null),
    React.createElement(Preview, null, previewText),
    React.createElement(
      Body,
      { style: styles.body },
      React.createElement(
        Container,
        { style: styles.container },

        // ── Header ──
        React.createElement(
          Section,
          { style: styles.header },
          React.createElement(Heading, { style: styles.headerTitle }, newsletterName),
          React.createElement(Text, { style: styles.headerSubtitle }, `Edition ${edition} · ${items.length} items`)
        ),

        // ── Intro ──
        React.createElement(
          Section,
          { style: styles.section },
          React.createElement(
            Text,
            { style: styles.intro },
            "The highest-signal AI and developer content from this week, curated and summarized for engineers building real products."
          )
        ),

        React.createElement(Hr, { style: styles.divider }),

        // ── Items ──
        ...items.map((item, index) =>
          React.createElement(
            Section,
            { key: index, style: styles.itemSection },

            // Score badge + title
            React.createElement(
              Text,
              { style: styles.itemMeta },
              `${item.source.replace("_", " ").toUpperCase()} · Score ${item.relevanceScore}/10`
            ),

            React.createElement(
              Heading,
              { as: "h2", style: styles.itemTitle },
              React.createElement(Link, { href: item.url, style: styles.itemLink }, item.title)
            ),

            // AI-generated summary
            React.createElement(Text, { style: styles.itemSummary }, item.summary),

            React.createElement(
              Link,
              { href: item.url, style: styles.readMore },
              "Read more →"
            ),

            index < items.length - 1
              ? React.createElement(Hr, { style: styles.itemDivider })
              : null
          )
        ),

        React.createElement(Hr, { style: styles.divider }),

        // ── Footer ──
        React.createElement(
          Section,
          { style: styles.footer },
          React.createElement(
            Text,
            { style: styles.footerText },
            `You're receiving this because you subscribed to ${newsletterName}.`
          ),
          React.createElement(
            Text,
            { style: styles.footerText },
            "Built with Node.js, MongoDB, Groq, and Resend."
          )
        )
      )
    )
  );
}

const styles = {
  body: {
    backgroundColor: "#f6f9fc",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  container: {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "20px 0 48px",
    marginBottom: "64px",
    maxWidth: "600px",
  },
  header: {
    backgroundColor: "#0f172a",
    padding: "32px 40px",
    borderRadius: "8px 8px 0 0",
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: "28px",
    fontWeight: "700",
    margin: "0 0 8px",
  },
  headerSubtitle: {
    color: "#94a3b8",
    fontSize: "14px",
    margin: "0",
  },
  section: {
    padding: "24px 40px 0",
  },
  intro: {
    color: "#475569",
    fontSize: "15px",
    lineHeight: "24px",
    margin: "0",
  },
  divider: {
    borderColor: "#e2e8f0",
    margin: "24px 40px",
  },
  itemSection: {
    padding: "0 40px",
  },
  itemMeta: {
    color: "#94a3b8",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "0.08em",
    margin: "0 0 6px",
    textTransform: "uppercase",
  },
  itemTitle: {
    fontSize: "18px",
    fontWeight: "600",
    margin: "0 0 10px",
    lineHeight: "1.3",
  },
  itemLink: {
    color: "#0f172a",
    textDecoration: "none",
  },
  itemSummary: {
    color: "#475569",
    fontSize: "14px",
    lineHeight: "22px",
    margin: "0 0 12px",
    whiteSpace: "pre-line",
  },
  readMore: {
    color: "#3b82f6",
    fontSize: "13px",
    fontWeight: "500",
    textDecoration: "none",
  },
  itemDivider: {
    borderColor: "#f1f5f9",
    margin: "24px 0",
  },
  footer: {
    padding: "0 40px",
  },
  footerText: {
    color: "#94a3b8",
    fontSize: "12px",
    lineHeight: "18px",
    margin: "0 0 4px",
  },
};

module.exports = { WeeklyDigest };