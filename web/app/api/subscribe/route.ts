// app/api/subscribe/route.ts
// POST /api/subscribe
// Accepts { name, email } and saves to MongoDB subscribers collection.
// Returns 200 on success, 409 if already subscribed, 400 on bad input.

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Subscriber from "@/lib/models/Subscriber";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email } = body;

    // Basic validation
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Simple email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if already subscribed
    const existing = await Subscriber.findOne({ email: email.toLowerCase() });

    if (existing) {
      if (existing.subscribed) {
        return NextResponse.json(
          { error: "This email is already subscribed" },
          { status: 409 }
        );
      } else {
        // Re-subscribe if they previously unsubscribed
        existing.subscribed = true;
        existing.name = name;
        await existing.save();
        return NextResponse.json({ message: "Welcome back! You're resubscribed." });
      }
    }

    // Create new subscriber
    await Subscriber.create({ name, email });

    return NextResponse.json(
      { message: "You're subscribed! First issue coming soon." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
