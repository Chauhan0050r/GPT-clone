import { useState } from "react";
import SplashScreen from "./SplashScreen";

type Props = { onAuth: (token: string, nickname: string) => void; onToggle: () => void };

const Register: React.FC<Props> = ({ onAuth, onToggle }) => {
  const [showSplash, setShowSplash] = useState(true);
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const register = async () => {
    setErr("");
    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, nickname }),
    });
    const data = await res.json();
    if (!res.ok) {
      setErr(data.error || "Registration failed");
    } else {
      onAuth(data.token, data.nickname);
    }
  };

  if (showSplash) return <SplashScreen onDone={() => setShowSplash(false)} />;

  return (
    <div className="auth-bg">
      <div className="auth-form-container">
        <form
          className="auth-card"
          onSubmit={e => {
            e.preventDefault();
            register();
          }}
        >
          <div className="auth-logo">
            <span className="gradient-logo" style={{ fontSize: "2rem" }}>💬 Proto Chat</span>
          </div>
          <h2 className="auth-title">Create an Account</h2>
          <input
            className="auth-input"
            value={email}
            onChange={e => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
          />
          <input
            className="auth-input"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            type="text"
            placeholder="Nickname"
          />
          <input
            className="auth-input"
            value={password}
            onChange={e => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
          />
          {err && <div className="auth-error">{err}</div>}
          <button className="auth-btn" type="submit">Register</button>
        </form>
        <button
          className="auth-toggle-button"
          type="button"
          onClick={onToggle}
        >
          Already have an account? Login
        </button>
      </div>
    </div>
  );
};
export default Register;
