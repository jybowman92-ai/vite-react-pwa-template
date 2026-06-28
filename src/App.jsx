import { useEffect, useRef, useState } from "react";
import ShareCard from "./ShareCard";
import { loadCooks, loadSelectedId, saveSelectedId } from "./utils/cookLog";
import { PW_PRO_KEY, safeGet, safeSet } from "./utils/storage";
import "./shareCard.css";

const THEMES = [
  { id: "ember", name: "Ember Pit", dab: "linear-gradient(160deg,#2a1c12,#ff7a25)", pro: false },
  { id: "ticket", name: "Butcher's Ticket", dab: "linear-gradient(160deg,#e7d8bd,#a8331f)", pro: true },
  { id: "midnight", name: "Midnight Probe", dab: "linear-gradient(160deg,#13202b,#7fd0ff)", pro: true },
  { id: "gold", name: "Competition Gold", dab: "linear-gradient(160deg,#20180b,#e8b562)", pro: true },
];

const FORMATS = [
  { id: "portrait", label: "Feed", pro: false },
  { id: "square", label: "Square", pro: true },
  { id: "story", label: "Story", pro: true },
];

const PRO_THEMES = new Set(THEMES.filter((t) => t.pro).map((t) => t.id));
const PRO_FORMATS = new Set(FORMATS.filter((f) => f.pro).map((f) => f.id));

export default function App() {
  const cardRef = useRef(null);

  // ---- cook log ----
  const [cooks] = useState(loadCooks);
  const [cookId, setCookId] = useState(() => loadSelectedId(cooks));
  const cook = cooks.find((c) => c.id === cookId) ?? cooks[0];

  // ---- card options ----
  const [theme, setTheme] = useState("ember");
  const [format, setFormat] = useState("portrait");
  const [hero, setHero] = useState("curve");
  const [animate, setAnimate] = useState(false);

  // ---- entitlement (debug-toggled for now) ----
  const [isPro, setIsPro] = useState(() => safeGet(PW_PRO_KEY) === "1");

  // ---- export/share UI ----
  const [busy, setBusy] = useState(null); // "share" | "download" | null
  const [hint, setHint] = useState(null); // null = show the default line
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
      setHint(null);
      setHintErr(false);
    }, 3200);
  };

  // ---- selection handlers (gate Pro-only options) ----
  const selectCook = (id) => {
    setCookId(id);
    saveSelectedId(id);
  };
  const selectTheme = (id) => {
    if (!isPro && PRO_THEMES.has(id)) return flashHint("That card style is Pro — flip on Pro (debug) to use it.");
    setTheme(id);
  };
  const selectFormat = (id) => {
    if (!isPro && PRO_FORMATS.has(id)) return flashHint("That format is Pro — flip on Pro (debug) to use it.");
    setFormat(id);
  };

  const togglePro = () => {
    const next = !isPro;
    setIsPro(next);
    safeSet(PW_PRO_KEY, next ? "1" : "0");
    // when locking back down, drop any Pro-only selections to the free defaults
    if (!next) {
      if (PRO_THEMES.has(theme)) setTheme("ember");
      if (PRO_FORMATS.has(format)) setFormat("portrait");
    }
  };

  const fileName = () => `pitwright-${cook.cut.toLowerCase().replace(/\s+/g, "-")}.png`;

  async function renderPNG() {
    // html2canvas is heavy and only needed on export — load it on demand.
    const { default: html2canvas } = await import("html2canvas");
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
          title: "My cook on Pitwright",
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
              <span className="sub">Pitwright · Pro</span>
            </h1>
          </div>
          <button
            className="debug-pro"
            data-on={isPro}
            onClick={togglePro}
            title="Debug: unlock Pro features"
            aria-pressed={isPro}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isPro ? (
                <path d="M7 11V7a5 5 0 0 1 10 0v4M5 11h14v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z" />
              ) : (
                <path d="M7 11V7a5 5 0 0 1 9.9-1M5 11h14v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z" />
              )}
            </svg>
            Pro {isPro ? "On" : "Off"}
          </button>
        </header>

        <section className="stage">
          <ShareCard key={cook.id} ref={cardRef} cook={cook} theme={theme} format={format} hero={hero} animate={animate} />
        </section>

        <div className="panel">
          <div>
            <div className="ctl-label" style={{ marginBottom: 10 }}>
              Sharing cook
            </div>
            <select className="cook-select" value={cook.id} onChange={(e) => selectCook(e.target.value)}>
              {cooks.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.cut} · {c.cookTimeLong}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="ctl-label" style={{ marginBottom: 10 }}>
              Card style
            </div>
            <div className="themes">
              {THEMES.map((t) => {
                const locked = t.pro && !isPro;
                return (
                  <button
                    key={t.id}
                    className="swatch"
                    aria-pressed={theme === t.id}
                    data-locked={locked}
                    onClick={() => selectTheme(t.id)}
                  >
                    <span className="dab" style={{ background: t.dab }} />
                    <span className="nm">{t.name}</span>
                    {locked && <span className="lock">PRO</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="two">
            <div>
              <div className="ctl-label" style={{ marginBottom: 10 }}>
                Format
              </div>
              <div className="seg" role="group" aria-label="Format">
                {FORMATS.map((f) => {
                  const locked = f.pro && !isPro;
                  return (
                    <button key={f.id} aria-pressed={format === f.id} data-locked={locked} onClick={() => selectFormat(f.id)}>
                      {f.label}
                      {locked && <span className="seg-lock">PRO</span>}
                    </button>
                  );
                })}
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
            {hint != null ? (
              hint
            ) : isPro ? (
              <>
                High-resolution image &middot; <b>Pro unlocked (debug)</b>
              </>
            ) : (
              <>
                High-resolution image &middot; <b>themes &amp; formats are Pro</b>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
