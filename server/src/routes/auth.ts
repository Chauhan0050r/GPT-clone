import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDb } from "../db";
import { nanoid } from "nanoid"; // <-- Add this!

const JWT_SECRET = process.env.JWT_SECRET || "changeme";
const router = Router();

// Register endpoint
router.post("/register", async (req, res) => {
  const { email, password, nickname } = req.body;
  if (!email || !password || !nickname)
    return res.status(400).json({ error: "All fields required" });

  const db = await getDb();
  if (db.data!.users.find(u => u.email === email))
    return res.status(400).json({ error: "Email already registered" });

  const hash = await bcrypt.hash(password, 10);

  // ✅ Assign a unique id to new user
  const newUser = {
    id: nanoid(),
    email,
    password: hash,
    nickname
  };
  db.data!.users.push(newUser);
  await db.write();

  // ✅ JWT includes userId now, not just email/nickname!
  const token = jwt.sign({ userId: newUser.id, nickname }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, nickname });
});

// Login endpoint
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const db = await getDb();
  const user = db.data!.users.find(u => u.email === email);
  if (!user) return res.status(400).json({ error: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: "Invalid credentials" });

  // ✅ JWT includes userId now, not just email/nickname!
  const token = jwt.sign({ userId: user.id, nickname: user.nickname }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, nickname: user.nickname });
});

// Get user info (protected)
router.get("/me", async (req, res) => {
  const auth = req.headers.authorization?.split(" ")[1];
  if (!auth) return res.status(401).json({ error: "No token" });
  try {
    const payload = jwt.verify(auth, JWT_SECRET) as any;
    res.json({ email: payload.email, nickname: payload.nickname, userId: payload.userId });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
