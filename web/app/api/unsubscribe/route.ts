// app/api/unsubscribe/route.ts
// GET /api/unsubscribe?token=xxx
// One-click unsubscribe — no login required.
// The token comes from the unsubscribeToken field on each subscriber.
// Email templates include this link automatically.

import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../lib/mongodb";
import Subscriber from "../../lib/models/Subscriber";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Missing unsubscribe token" },
        { status: 400 }
      );
    }

    await connectDB();

    const subscriber = await Subscriber.findOne({ unsubscribeToken: token });

    if (!subscriber) {
      return NextResponse.json(
        { error: "Invalid or expired unsubscribe token" },
        { status: 404 }
      );
    }

    if (!subscriber.subscribed) {
      // Already unsubscribed — return success anyway
      return new NextResponse(unsubscribedHTML("You're already unsubscribed."), {
        headers: { "Content-Type": "text/html" },
      });
    }

    subscriber.subscribed = false;
    await subscriber.save();

    // Return a clean HTML page instead of JSON
    // so clicking the link in an email shows a proper confirmation
    return new NextResponse(unsubscribedHTML("You've been unsubscribed successfully."), {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

function unsubscribedHTML(message: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Unsubscribed — AI Dev Roundup</title>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f8fafc; }
    .card { background: white; padding: 48px; border-radius: 12px; text-align: center; max-width: 400px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    h1 { color: #0f172a; font-size: 24px; margin: 0 0 12px; }
    p { color: #64748b; margin: 0; }
  </style>
</head>
<body>
  <div class="card">
    <h1>✓ ${message}</h1>
    <p>You won't receive any more emails from AI Dev Roundup.</p>
  </div>
</body>
</html>
  `.trim();
}
