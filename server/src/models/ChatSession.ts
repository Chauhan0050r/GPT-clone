// backend/models/ChatSession.ts

import mongoose, { Schema, Document } from "mongoose";

/**
 * Message subdocument schema
 */
const MessageSchema = new Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false } // prevent subdocument _id creation
);

/**
 * Chat session schema
 */
const ChatSessionSchema = new Schema(
  {
    userId: {
      type: String, // or Schema.Types.ObjectId if you're referencing a User collection
      required: true,
    },
    sessionName: {
      type: String,
      default: "New Chat",
    },
    messages: [MessageSchema],
  },
  { timestamps: true } // automatically adds createdAt & updatedAt
);

// Optional: interface for model typings
export interface IChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface IChatSession extends Document {
  userId: string;
  sessionName: string;
  messages: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// Export the model
export const ChatSessionModel = mongoose.model<IChatSession>(
  "ChatSession",
  ChatSessionSchema
);
