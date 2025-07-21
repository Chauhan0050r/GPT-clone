import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { join } from "path";

// --- Users DB ---
interface User {
  id: string;
  email: string;
  password: string;
  nickname: string;
}
interface UserData { users: User[] }
const defaultUserData: UserData = { users: [] };
const userFile = join(__dirname, "models", "users.json");
const userAdapter = new JSONFile<UserData>(userFile);
const userDb = new Low<UserData>(userAdapter, defaultUserData);

export async function getDb() {
  await userDb.read();
  if (!userDb.data) {
    userDb.data = defaultUserData;
    await userDb.write();
  }
  return userDb;
}

// --- Chats DB ---
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
export interface ChatSession {
  id: string;
  userEmail: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
}
interface ChatData { sessions: ChatSession[] }
const defaultChatData: ChatData = { sessions: [] };
const chatFile = join(__dirname, "models", "chats.json");
const chatAdapter = new JSONFile<ChatData>(chatFile);
const chatDb = new Low<ChatData>(chatAdapter, defaultChatData);

export async function getChatsDb() {
  await chatDb.read();
  if (!chatDb.data) {
    chatDb.data = defaultChatData;
    await chatDb.write();
  }
  return chatDb;
}
