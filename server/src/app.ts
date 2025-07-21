import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import chatRouter from "./routes/chat";
import authRouter from "./routes/auth";
import { connectDB } from "./db/index";
import sessionRoutes from "./routes/sessions";



dotenv.config();
console.log("Groq API Key Loaded:", process.env.GROQ_API_KEY);

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/chat", chatRouter);
app.use("/api/auth", authRouter);
app.use("/api/sessions", sessionRoutes);

connectDB();
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
export default app;

