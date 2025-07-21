// // backend/routes/sessions.ts

// import { Router, Request, Response } from "express";
// import { ChatSessionModel } from "../models/ChatSession";
// import { getUserIdFromToken } from "../utils/auth";

// const router = Router();

// /**
//  * ✅ Get all sessions for the authenticated user
//  */
// router.get("/", async (req: Request, res: Response) => {
//   const userId = getUserIdFromToken(req.headers.authorization);
//   if (!userId) return res.status(401).json({ error: "Unauthorized" });

//   try {
//     const sessions = await ChatSessionModel.find({ userId })
//       .sort({ createdAt: -1 })
//       .select("_id sessionName createdAt"); // Send lightweight list

//     res.json(sessions);
//   } catch (err) {
//     console.error("Error fetching sessions:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// /**
//  * ✅ Create a new chat session
//  */
// router.post("/", async (req: Request, res: Response) => {
//   const userId = getUserIdFromToken(req.headers.authorization);
//   if (!userId) return res.status(401).json({ error: "Unauthorized" });

//   try {
//     const session = await new ChatSessionModel({
//       userId,
//       sessionName: req.body.sessionName || "New Chat",
//       messages: [],
//     }).save();

//     res.json(session);
//   } catch (err) {
//     console.error("Error creating session:", err);
//     res.status(500).json({ error: "Failed to create session" });
//   }
// });

// /**
//  * ✅ Get a specific session by sessionId (only if owned by user)
//  */
// router.get("/:sessionId", async (req: Request, res: Response) => {
//   const userId = getUserIdFromToken(req.headers.authorization);
//   if (!userId) return res.status(401).json({ error: "Unauthorized" });

//   try {
//     const session = await ChatSessionModel.findOne({
//       _id: req.params.sessionId,
//       userId,
//     });

//     if (!session) {
//       return res.status(404).json({ error: "Session not found" });
//     }

//     res.json(session);
//   } catch (err) {
//     console.error("Error fetching session:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// export default router;
import { Router, Request, Response } from "express";
import { ChatSessionModel } from "../models/ChatSession";
import { getUserIdFromToken } from "../utils/auth";

const router = Router();

/**
 * ✅ Get all sessions for the authenticated user
 */
router.get("/", async (req: Request, res: Response) => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const sessions = await ChatSessionModel.find({ userId })
      .sort({ createdAt: -1 })
      .select("_id sessionName createdAt");
    res.json(sessions);
  } catch (err) {
    console.error("Error fetching sessions:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * ✅ Create a new chat session
 */
router.post("/", async (req: Request, res: Response) => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const session = await new ChatSessionModel({
      userId,
      sessionName: req.body.sessionName || "New Chat",
      messages: [],
    }).save();

    res.json(session);
  } catch (err) {
    console.error("Error creating session:", err);
    res.status(500).json({ error: "Failed to create session" });
  }
});

/**
 * ✅ Get a specific session by sessionId
 */
router.get("/:sessionId", async (req: Request, res: Response) => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const session = await ChatSessionModel.findOne({
      _id: req.params.sessionId,
      userId,
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json(session);
  } catch (err) {
    console.error("Error fetching session:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * ✅ PATCH: Update session name
 */
router.patch("/:sessionId", async (req: Request, res: Response) => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { newName } = req.body;

  if (!newName || typeof newName !== "string") {
    return res.status(400).json({ error: "Invalid session name" });
  }

  try {
    await ChatSessionModel.findOneAndUpdate(
      { _id: req.params.sessionId, userId },
      { sessionName: newName }
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error updating session:", err);
    res.status(500).json({ error: "Failed to update session" });
  }
});

/**
 * ✅ DELETE session
 */
router.delete("/:sessionId", async (req: Request, res: Response) => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    await ChatSessionModel.deleteOne({
      _id: req.params.sessionId,
      userId,
    });
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting session:", err);
    res.status(500).json({ error: "Failed to delete session" });
  }
});

export default router;
