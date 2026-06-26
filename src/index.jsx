import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";
import App from "./App.jsx";

// Catches React render errors and shows a readable crash screen instead of a blank page.
class ErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(e) { return { error: e }; }
  componentDidCatch(error, info) {
    console.error("App crashed:", error, info?.componentStack);
  }
  render() {
    if (this.state.error) return (
      <div style={{ padding: 32, fontFamily: "-apple-system,sans-serif", color: "#eee", background: "#0f0f0f", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <div style={{ fontWeight: 800, fontSize: 20 }}>Something went wrong</div>
        <div style={{ color: "#888", fontSize: 14, maxWidth: 320, textAlign: "center" }}>Reload the page to try again. Your data should still be safe.</div>
        <div style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 10, padding: "12px 14px", maxWidth: 340, width: "100%", wordBreak: "break-word", fontSize: 12, color: "#f87171", textAlign: "left", lineHeight: 1.5 }}>
          {this.state.error.toString()}
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{ background: "var(--accent, #f97316)", color: "#fff", border: "none", borderRadius: 12, padding: "12px 24px", fontSize: 15, fontWeight: 800, cursor: "pointer" }}
        >
          Reload
        </button>
      </div>
    );
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// PWA service worker - only needed for offline support.
// Remove this block if you don't need offline capability.
// Requires a public/service-worker.js file.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js")
      .then(reg => {
        reg.addEventListener("updatefound", () => {
          const next = reg.installing;
          next.addEventListener("statechange", () => {
            if (next.state === "installed" && navigator.serviceWorker.controller) {
              window._swWaitingReg = reg;
              window.dispatchEvent(new CustomEvent("swUpdateAvailable"));
            }
          });
        });
      })
      .catch(() => {});
  });
}
