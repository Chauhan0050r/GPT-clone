// import React from "react";

// interface SidebarProps {
//   onNew: () => void;
//   onClose: () => void;
// }

// export default function Sidebar({ onNew, onClose }: SidebarProps) {
//   return (
//     <aside className="floating-sidebar">
//       <div className="floating-sidebar-header">
//         <span>📚 Chat</span>
//         <button onClick={onClose}>✕</button>
//       </div>
//       <button className="sidebar-new" onClick={onNew}>
//         + New Chat
//       </button>
//     </aside>
//   );
// }
import React from "react";

interface Session {
  _id: string;
  sessionName: string;
  createdAt: string;
}

interface SidebarProps {
  sessions: Session[];
  activeSessionId: string | null;
  onNew: () => void;
  onClose: () => void;
  onSelectSession: (sessionId: string) => void;
}

export default function Sidebar({
  sessions,
  activeSessionId,
  onNew,
  onClose,
  onSelectSession,
}: SidebarProps) {
  return (
    <aside className="floating-sidebar">
      <div className="floating-sidebar-header">
        <span>💬 Your Chats</span>
        <button onClick={onClose}>✕</button>
      </div>

      <button className="sidebar-new" onClick={onNew}>
        + New Chat
      </button>

      <ul className="sidebar-session-list">
        {sessions.length === 0 ? (
          <p className="empty-sessions">No previous sessions</p>
        ) : (
          sessions.map((session) => (
            <li
              key={session._id}
              onClick={() => onSelectSession(session._id)}
              className={
                "session-item" +
                (session._id === activeSessionId ? " active-session" : "")
              }
              style={{ cursor: "pointer" }}
            >
              <div className="session-title">
                {session.sessionName || "Untitled Chat"}
              </div>
              <div className="session-timestamp">
                {new Date(session.createdAt).toLocaleString()}
              </div>
            </li>
          ))
        )}
      </ul>
    </aside>
  );
}
