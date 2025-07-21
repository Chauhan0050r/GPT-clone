import { BufferMemory } from "langchain/memory";

export const memory = new BufferMemory({
  returnMessages: true,
  memoryKey: "conversation_history",
});
