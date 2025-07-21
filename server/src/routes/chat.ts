import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { llm } from "../langchain/llm";
import { getUserIdFromToken } from "../utils/auth";
import { ChatSessionModel } from "../models/ChatSession";

dotenv.config();
const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "changeme";

router.post("/", async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  let userId: string;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    userId = decoded.userId;
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }

  const { conversation, sessionId } = req.body;

  if (!Array.isArray(conversation)) {
    return res.status(400).json({ error: "Invalid conversation format" });
  }

  if (!sessionId) {
    return res.status(400).json({ error: "Missing sessionId" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  console.log(`🟢 Chat started for session: ${sessionId}`);

  try {
    const stream = await llm.stream(conversation);

    let aiReply = "";

    for await (const chunk of stream) {
      if (chunk && chunk.content) {
        aiReply += chunk.content;
        res.write(`data: ${JSON.stringify({ content: chunk.content })}\n\n`);
      }
    }

    const userMessage = conversation.at(-1);

    if (userMessage?.role === "user") {
      await ChatSessionModel.findByIdAndUpdate(sessionId, {
        $push: {
          messages: [
            { role: "user", content: userMessage.content, timestamp: new Date() },
            { role: "assistant", content: aiReply, timestamp: new Date() },
          ],
        },
      });
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    console.error("LLM error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Streaming error" });
    } else {
      res.write(`data: ${JSON.stringify({ error: "Streaming failed" })}\n\n`);
      res.end();
    }
  }

  req.on("close", () => {
    console.log(`🔌 Client closed connection: session ${sessionId}`);
  });
});

export default router;
