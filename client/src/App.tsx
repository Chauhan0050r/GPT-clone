import { useState, useRef, useEffect } from "react";
import ChatMessage from "./components/ChatMessage";
import Register from "./components/Register";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

type ChatSession = {
  _id: string;
  sessionName: string;
  createdAt: string;
};

const API_URL = "http://localhost:5000";
const INTRO_MSG =
  "I may be a clone, but I can help you like the real one. Tell me, how can I help you today?";

function App() {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState<Message[]>([]);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [nickname, setNickname] = useState(localStorage.getItem("nickname") || "");
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    localStorage.getItem("lastSessionId") || null
  );

  const chatEndRef = useRef<HTMLDivElement>(null);
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
    if (!token) return;

    fetch(`${API_URL}/api/sessions`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setSessions(data || []))
      .catch((err) => console.error("❌ Failed to load sessions", err));
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const resumeOrCreate = async () => {
      const lastId = localStorage.getItem("lastSessionId");

      if (lastId) {
        try {
          const res = await fetch(`${API_URL}/api/sessions/${lastId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const session = await res.json();
          setActiveSessionId(session._id);
          localStorage.setItem("lastSessionId", session._id);

          const messages = (session.messages || []).map((m: any) => ({
            role: m.role,
            content: m.content,
            timestamp: new Date(m.timestamp).toLocaleTimeString(),
          }));

          setChat(
            messages.length === 0
              ? [
                  {
                    role: "assistant",
                    content: INTRO_MSG,
                    timestamp: new Date().toLocaleTimeString(),
                  },
                ]
              : messages
          );
          return;
        } catch (err) {
          console.warn("⚠️ Could not resume last session.");
          localStorage.removeItem("lastSessionId");
        }
      }

      await handleNewChat(true); // create new session on login
    };

    resumeOrCreate();
  }, [token]);

  const streamChatResponse = async (conversation: any[]) => {
    if (!activeSessionId) {
      alert("Please start a new chat session first.");
      return;
    }

    setLoading(true);
    setChat((prev) => [...prev, { role: "assistant", content: "", timestamp: "" }]);

    const res = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ conversation, sessionId: activeSessionId }),
    });

    if (!res.body) {
      setLoading(false);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let partial = "";
    let done = false;
    let text = "";
    const DELAY = 35;

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        partial += decoder.decode(value);
        const regex = /data: (.+?)\n\n/g;
        let match;
        while ((match = regex.exec(partial))) {
          const chunk = match[1];
          if (chunk === "[DONE]") {
            setLoading(false);
            setChat((prev) => {
              const updated = [...prev];
              updated[updated.length - 1].timestamp = new Date().toLocaleTimeString();
              return updated;
            });
            return;
          }
          try {
            const data = JSON.parse(chunk);
            const tokenPiece = data.content || "";
            if (tokenPiece) {
              text += tokenPiece;
              await sleep(DELAY);
              setChat((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: text,
                };
                return updated;
              });
            }
          } catch (err) {
            console.error("Stream parsing error:", err, chunk);
          }
        }
        partial = partial.endsWith("\n\n") ? "" : partial;
      }
    }

    setLoading(false);
  };

  const sendMsg = async () => {
    if (!input.trim() || !token || loading || !activeSessionId) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString(),
    };

    setChat((prev) => [...prev, userMessage]);
    setInput("");

    const conversation = [...chat, userMessage]
      .filter((msg) => msg.role !== "assistant" || msg.content !== INTRO_MSG)
      .map(({ role, content }) => ({ role, content }));

    // ✅ Rename chat session (if it's the first message)
    if (chat.length === 0 && userMessage.content.trim().length > 0) {
      try {
        await fetch(`${API_URL}/api/sessions/${activeSessionId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ newName: userMessage.content.slice(0, 50) }),
        });

        // update frontend session list
        setSessions((prev) =>
          prev.map((s) =>
            s._id === activeSessionId
              ? { ...s, sessionName: userMessage.content.slice(0, 50) }
              : s
          )
        );
      } catch (error) {
        console.error("Error updating session name:", error);
      }
    }

    await streamChatResponse(conversation);
  };

  const handleNewChat = async (suppressAdd?: boolean) => {
    try {
      const res = await fetch(`${API_URL}/api/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sessionName: "New Chat" }),
      });

      const newSession = await res.json();
      setActiveSessionId(newSession._id);
      localStorage.setItem("lastSessionId", newSession._id);

      setChat([
        {
          role: "assistant",
          content: INTRO_MSG,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      setShowSidebar(false);

      if (!suppressAdd) {
        setSessions((prev) => [newSession, ...prev]);
      }
    } catch (err) {
      console.error("❌ Failed to create new session", err);
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    setActiveSessionId(sessionId);
    localStorage.setItem("lastSessionId", sessionId);
    setShowSidebar(false);

    const res = await fetch(`${API_URL}/api/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const session = await res.json();
    setChat(
      (session.messages || []).map((m: any) => ({
        role: m.role,
        content: m.content,
        timestamp: new Date(m.timestamp).toLocaleTimeString(),
      }))
    );
  };

  const handleDeleteSession = async (sessionId: string) => {
    const confirm = window.confirm("🗑️ Are you sure you want to delete this session?");
    if (!confirm) return;

    try {
      await fetch(`${API_URL}/api/sessions/${sessionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      setSessions((prev) => prev.filter((s) => s._id !== sessionId));

      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        localStorage.removeItem("lastSessionId");
        setChat([]);
      }
    } catch (err) {
      console.error("❌ Failed to delete session", err);
    }
  };

  const handleAuth = (tok: string, nick: string) => {
    setToken(tok);
    setNickname(nick);
    localStorage.setItem("token", tok);
    localStorage.setItem("nickname", nick);
  };

  const logout = () => {
    setToken("");
    setNickname("");
    localStorage.removeItem("token");
    localStorage.removeItem("nickname");
    localStorage.removeItem("lastSessionId");
    setChat([]);
    setActiveSessionId(null);
  };

  if (!token) {
    return (
      <div className="center-screen">
        {showRegister ? (
          <Register onAuth={handleAuth} onToggle={() => setShowRegister(false)} />
        ) : (
          <Login onAuth={handleAuth} onToggle={() => setShowRegister(true)} />
        )}
      </div>
    );
  }

  return (
    <div>
      {showSidebar && (
        <Sidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onNew={() => handleNewChat(false)}
          onSelectSession={handleSelectSession}
          onDeleteSession={handleDeleteSession}
          onClose={() => setShowSidebar(false)}
        />
      )}

      <header className="header-modern">
        <div className="header-inner">
          <button onClick={() => setShowSidebar(true)} className="text-white text-xl mr-4">
            ☰
          </button>
          <span className="gradient-logo">💬 GPT Clone</span>
          <div className="header-action">
            <span>Hello, {nickname}!</span>
            <button className="text-red-400 underline ml-3 text-sm" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="main-card">
        <div className="message-list">
          {chat.map((msg, i) => (
            <ChatMessage key={i} {...msg} />
          ))}
          {loading && <div className="text-blue-600 text-center animate-pulse">AI is thinking...</div>}
          <div ref={chatEndRef} />
        </div>
        <div className="input-bar">
          <input
            type="text"
            className="flex-1 outline-none"
            placeholder="Type a message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMsg();
            }}
            disabled={loading}
            autoFocus
          />
          <button onClick={sendMsg} disabled={!input.trim() || loading}>
            {loading ? "Sending…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
