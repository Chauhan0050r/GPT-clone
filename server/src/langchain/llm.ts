import { ChatGroq } from "@langchain/groq";
import dotenv from "dotenv";

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL = process.env.GROQ_MODEL || "llama3-70b-8192";

if (!GROQ_API_KEY) {
  throw new Error("❌ Missing GROQ_API_KEY in environment variables.");
}

// ✅ Create and export LangChain's Groq chat model instance
export const llm = new ChatGroq({
  apiKey: GROQ_API_KEY,
  model: MODEL,
  temperature: 0.7,
  maxTokens: 1024,
});
