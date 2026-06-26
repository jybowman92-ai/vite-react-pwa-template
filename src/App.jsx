import { useState } from "react";
import { fs } from "./utils/formatting";

// CSS design tokens - all colors reference CSS variables from src/styles.css.
// Adding .light to <html> re-themes everything at once; no other changes needed.
const BG     = "var(--bg)";
const CARD   = "var(--card)";
const BORDER = "var(--border)";
const TEXT   = "var(--text)";
const MUTED  = "var(--muted)";
const ACCENT = "var(--accent)";

export default function App() {
  const [darkMode, setDarkMode] = useState(true);

  const toggleTheme = () => {
    document.documentElement.classList.toggle("light");
    setDarkMode(d => !d);
  };

  return (
    <div style={{ minHeight: "100dvh", background: BG, color: TEXT, padding: 24 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: fs(22), fontWeight: 800 }}>App Name</h1>
          <button
            onClick={toggleTheme}
            style={{ background: CARD, border: `1px solid ${BORDER}`, color: TEXT, borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: fs(13) }}
          >
            {darkMode ? "Light" : "Dark"}
          </button>
        </div>

        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16 }}>
          <p style={{ margin: 0, fontSize: fs(14), color: MUTED }}>Your app goes here.</p>
        </div>

        <p style={{ marginTop: 32, fontSize: fs(12), color: MUTED, textAlign: "center" }}>
          Accent color: <span style={{ color: ACCENT }}>var(--accent)</span> - change in src/styles.css
        </p>

      </div>
    </div>
  );
}
