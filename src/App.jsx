import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import ShareCard from "./ShareCard";
import { cook } from "./utils/cook";
import "./shareCard.css";

const THEMES = [
  { id: "ember", name: "Ember Pit", dab: "linear-gradient(160deg,#2a1c12,#ff7a25)", pro: false },
  { id: "ticket", name: "Butcher's Ticket", dab: "linear-gradient(160deg,#e7d8bd,#a8331f)", pro: true },
  { id: "midnight", name: "Midnight Probe", dab: "linear-gradient(160deg,#13202b,#7fd0ff)", pro: true },
  { id: "gold", name: "Competition Gold", dab: "linear-gradient(160deg,#20180b,#e8b562)", pro: true },
];

const FORMATS = [
  { id: "portrait", label: "Feed" },
  { id: "square", label: "Square" },
  { id: "story", label: "Story" },
];

const HINT_DEFAULT = (
  <>
    High-resolution image &middot; <b>themes &amp; formats are Pro</b>
  </>
);

const fileName = () => `grillwright-${cook.cut.toLowerCase().replace(/\s+/g, "-")}.png`;

export default function App() {
  const cardRef = useRef(null);

  const [theme, setTheme] = useState("ember");
  const [format, setFormat] = useState("portrait");
  const [hero, setHero] = useState("curve");
  const [animate, setAnimate] = useState(false);

  const [busy, setBusy] = useState(null); // "share" | "download" | null
  const [hint, setHint] = useState(HINT_DEFAULT);
  const [hintErr, setHintErr] = useState(false);
  const hintTimer = useRef(null);

  // play the curve draw-in once on mount, unless reduced motion is requested
  useEffect(() => {
    if (!matchMedia("(prefers-reduced-motion:reduce)").matches) {
      requestAnimationFrame(() => setAnimate(true));
    }
  }, []);

  useEffect(() => () => clearTimeout(hintTimer.current), []);

  const flashHint = (msg, err = false) => {
    clearTimeout(hintTimer.current);
    setHint(msg);
    setHintErr(err);
    hintTimer.current = setTimeout(() => {
      setHint(HINT_DEFAULT);
      setHintErr(false);
    }, 3200);
  };

  async function renderPNG() {
    await document.fonts.ready;
    const card = cardRef.current;
    card.classList.add("capturing");
    const scale = Math.min(3, 1200 / card.clientWidth);
    try {
      const canvas = await html2canvas(card, {
        scale,
        backgroundColor: null,
        useCORS: true,
        logging: false,
        windowWidth: document.documentElement.clientWidth,
      });
      return await new Promise((res) => canvas.toBlob((b) => res(b), "image/png", 0.97));
    } finally {
      card.classList.remove("capturing");
    }
  }

  async function handleDownload() {
    setBusy("download");
    try {
      const blob = await renderPNG();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName();
      a.click();
      URL.revokeObjectURL(url);
      flashHint("Saved to your downloads.");
    } catch {
      flashHint("Couldn’t render the image — try again.", true);
    } finally {
      setBusy(null);
    }
  }

  async function handleShare() {
    setBusy("share");
    try {
      const blob = await renderPNG();
      const file = new File([blob], fileName(), { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "My cook on Grillwright",
          text: `${cook.cut} · ${cook.cookTimeLong} 🔥`,
        });
        flashHint("Shared.");
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName();
        a.click();
        URL.revokeObjectURL(url);
        flashHint("Sharing isn’t supported here — saved the image instead.");
      }
    } catch (err) {
      if (!(err && err.name === "AbortError")) flashHint("Couldn’t share — try again.", true);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="gw-app">
      <div className="app">
        <header className="top">
          <span className="brandmark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2c1.5 3-1 4.5-1 7 0 1.7 1.3 3 3 3 .6 1-.2 3-2 3" />
              <path d="M8 14c-1.5 1.5-2 3.5-1 5.5C8.2 21.7 10 22 12 22c3.3 0 6-2.2 6-5.5 0-2-1-3.5-2-4.5" />
            </svg>
          </span>
          <div>
            <h1>
              Share Your Cook
              <span className="sub">Grillwright · Pro</span>
            </h1>
          </div>
        </header>

        <section className="stage">
          <ShareCard ref={cardRef} cook={cook} theme={theme} format={format} hero={hero} animate={animate} />
        </section>

        <div className="panel">
          <div>
            <div className="ctl-label" style={{ marginBottom: 10 }}>
              Card style
            </div>
            <div className="themes">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  className="swatch"
                  aria-pressed={theme === t.id}
                  onClick={() => setTheme(t.id)}
                >
                  <span className="dab" style={{ background: t.dab }} />
                  <span className="nm">{t.name}</span>
                  {t.pro && <span className="lock">PRO</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="two">
            <div>
              <div className="ctl-label" style={{ marginBottom: 10 }}>
                Format
              </div>
              <div className="seg" role="group" aria-label="Format">
                {FORMATS.map((f) => (
                  <button key={f.id} aria-pressed={format === f.id} onClick={() => setFormat(f.id)}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="ctl-label" style={{ marginBottom: 10 }}>
                Hero
              </div>
              <div className="seg" role="group" aria-label="Hero">
                <button aria-pressed={hero === "curve"} onClick={() => setHero("curve")}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 17l5-6 4 3 6-8" />
                  </svg>
                  Curve
                </button>
                <button aria-pressed={hero === "photo"} onClick={() => setHero("photo")}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  Photo
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="actions">
          <button className="btn btn--primary" disabled={busy !== null} onClick={handleShare}>
            {busy === "share" ? (
              <span className="spin" />
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8h16v-8" />
                <path d="M12 16V4" />
                <path d="M8 8l4-4 4 4" />
              </svg>
            )}
            <span>{busy === "share" ? "Rendering…" : "Share cook"}</span>
          </button>
          <button className="btn btn--ghost" disabled={busy !== null} onClick={handleDownload}>
            {busy === "download" ? (
              <span className="spin" />
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 16v4h16v-4" />
                <path d="M12 4v12" />
                <path d="M8 12l4 4 4-4" />
              </svg>
            )}
            <span>{busy === "download" ? "Rendering…" : "Download PNG"}</span>
          </button>
          <p className="hint" style={hintErr ? { color: "#ff8a5c" } : undefined}>
            {hint}
          </p>
        </div>
      </div>
    </div>
  );
}
