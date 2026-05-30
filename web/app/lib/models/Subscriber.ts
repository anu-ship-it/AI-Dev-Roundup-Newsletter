// lib/models/Subscriber.ts
// Schema for newsletter subscribers.
// Each subscriber has a unique unsubscribe token so they can
// opt out with one click without needing to log in.

import mongoose, { Schema, Document } from "mongoose";
import crypto from "crypto";

export interface ISubscriber extends Document {
  email: string;
  name: string;
  unsubscribeToken: string;
  subscribed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriberSchema = new Schema<ISubscriber>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Random token used for one-click unsubscribe links
    // Generated automatically on creation
    unsubscribeToken: {
      type: String,
      default: () => crypto.randomBytes(32).toString("hex"),
      unique: true,
    },
    subscribed: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Prevent model recompilation in Next.js hot reload
export default mongoose.models.Subscriber ||
  mongoose.model<ISubscriber>("Subscriber", SubscriberSchema);
  