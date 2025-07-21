import React, { useEffect } from "react";

interface SplashScreenProps {
  onDone: () => void;
}
const SplashScreen: React.FC<SplashScreenProps> = ({ onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 2000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="splash-screen">
      <div className="splash-inner">
        <div className="splash-logo">
          <svg width="64" height="64" viewBox="0 0 64 64">
            <defs>
              <linearGradient id="glow" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#43cea2" />
                <stop offset="100%" stopColor="#185a9d" />
              </linearGradient>
            </defs>
            <circle cx="32" cy="32" r="30" fill="url(#glow)" opacity="0.95" />
            <text x="50%" y="54%" textAnchor="middle" fontSize="28" fontWeight="700" fill="#fff" dy=".3em">💬</text>
          </svg>
        </div>
        <div className="splash-title">Proto Chat</div>
      </div>
    </div>
  );
};
export default SplashScreen;
