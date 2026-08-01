import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ai-dev-roundup-newsletter.vercel.app"),
  title: {
    default: "AI Dev Roundup",
    template: "%s | AI Dev Roundup",
  },
  description:
    "Stay updated with the latest AI development news, GitHub repositories, research papers, tools, frameworks, and industry insights delivered weekly.",
  keywords: [
    "AI",
    "Artificial Intelligence",
    "AI Newsletter",
    "Machine Learning",
    "LLM",
    "GitHub",
    "OpenAI",
    "Anthropic",
    "Gemini",
    "Deep Learning",
    "AI Tools",
    "Developers",
  ],
  openGraph: {
    title: "AI Dev Roundup",
    description:
      "Weekly curated AI news, tools, GitHub repositories, and research papers for developers.",
    url: "https://ai-dev-roundup-newsletter.vercel.app",
    siteName: "AI Dev Roundup",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Dev Roundup",
    description:
      "Weekly curated AI news, GitHub repositories, tools, and research papers.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
