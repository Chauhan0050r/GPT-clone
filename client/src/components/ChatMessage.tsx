import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

type Props = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

export default function ChatMessage({ role, content, timestamp }: Props) {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={`bubble ${isUser ? "user" : "assistant"}`}
    >
      <div className="avatar">{isUser ? "U" : "AI"}</div>

      <div className="msg prose prose-invert prose-sm max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {content}
        </ReactMarkdown>

        {/* Timestamp at bottom right */}
        <span className="timestamp">{timestamp}</span>
      </div>
    </motion.div>
  );
}
