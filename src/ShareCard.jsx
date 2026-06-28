import { forwardRef, useEffect, useMemo, useRef } from "react";
import { buildCurve } from "./utils/cook";

// ---- tiny inline icon set (camelCased for JSX) ----
function FlameIcon({ on }) {
  return (
    <svg viewBox="0 0 24 24" className={on ? "on" : "off"} fill="currentColor" aria-hidden="true">
      <path d="M12 2c1.6 3-1 4.6-1 7 0 1.7 1.4 3 3.2 3 .6 1.1-.2 3-2 3-.2 1.7 1 3.4 2.6 3.8C13.4 22 12.8 22 12 22c-3.6 0-6.5-2.4-6.5-6 0-2.4 1.4-4 2.7-5.6C9.7 8.4 11 6.4 11 4c0-.9 0-1.6 1-2z" />
    </svg>
  );
}

function WordmarkDot() {
  return (
    <span className="dot" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="#160f0a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3c1.4 2.6-.8 3.8-.8 6 0 1.5 1.2 2.6 2.6 2.6" />
        <path d="M8.5 13c-1.4 1.4-1.8 3.2-.9 5C8.6 19.8 10.2 20 12 20c3 0 5.5-2 5.5-5 0-1.8-.9-3.2-1.8-4" />
      </svg>
    </span>
  );
}

/**
 * The share card. Driven entirely by props + the static cook object.
 * Exposes its root <article> via ref so the parent can hand it to html2canvas.
 */
const ShareCard = forwardRef(function ShareCard({ cook, theme, format, hero, animate }, ref) {
  const localRef = useRef(null);

  // let the parent and this component both reference the same node
  const setRefs = (node) => {
    localRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  // responsive unit: 1u = 1% of card width -> resolution-independent layout
  useEffect(() => {
    const el = localRef.current;
    if (!el) return;
    const setUnit = () => el.style.setProperty("--u", el.clientWidth / 100 + "px");
    setUnit();
    const ro = new ResizeObserver(setUnit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const c = useMemo(() => buildCurve(cook.curve), [cook.curve]);

  return (
    <article
      ref={setRefs}
      className={`card${hero === "photo" ? " is-photo" : ""}${animate ? " animate" : ""}`}
      data-theme={theme}
      data-format={format}
    >
      <div className="card__glow" aria-hidden="true" />
      <div className="card__edge top" aria-hidden="true" />
      <div className="card__edge bottom" aria-hidden="true" />

      <div className="inner">
        <div className="row-brand">
          <div className="wordmark">
            <WordmarkDot />
            <span className="name">Grillwright</span>
          </div>
          <span className="tag-pro">PRO</span>
        </div>

        <div className="head">
          <div className="eyebrow">
            {cook.category.toUpperCase()} · {cook.wood.toUpperCase()}
          </div>
          <h2 className="cut">{cook.cut}</h2>
          <div className="descr">{cook.descriptor}</div>
        </div>

        <div className="hero">
          <span className="hero__label">INTERNAL TEMP</span>
          <span className="hero__peak">{cook.pulledTemp}°F</span>
          <svg viewBox="0 0 300 160" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="ringFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--c-ring)" stopOpacity=".34" />
                <stop offset="100%" stopColor="var(--c-ring)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <g className="grid">
              <line x1="0" y1="40" x2="300" y2="40" />
              <line x1="0" y1="80" x2="300" y2="80" />
              <line x1="0" y1="120" x2="300" y2="120" />
            </g>
            <path className="curve-area" d={c.area} />
            <path className="curve-line" d={c.line} />
            <text className="stall-tag" x={c.stall.x.toFixed(1)} y={c.stall.y.toFixed(1)} fontSize="7">
              STALL
            </text>
            <circle className="end-ring" cx={c.end.x} cy={c.end.y} r="5" />
            <circle className="end-dot" cx={c.end.x} cy={c.end.y} r="2.6" />
          </svg>
          <div className="hero__photo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="6" width="18" height="13" rx="2" />
              <circle cx="12" cy="12.5" r="3.2" />
              <path d="M8 6l1.2-2h5.6L16 6" />
            </svg>
            <span>Add a cook photo</span>
          </div>
        </div>

        <div className="stats">
          <div className="stat">
            <div className="v">{cook.cookTime}</div>
            <div className="k">Cook Time</div>
          </div>
          <div className="stat">
            <div className="v">
              {cook.pulledTemp}
              <small>°F</small>
            </div>
            <div className="k">Pulled At</div>
          </div>
          <div className="stat">
            <div className="v">{cook.woodShort}</div>
            <div className="k">Smoke Wood</div>
          </div>
        </div>

        <div className="row-meta">
          <div className="flames" aria-label={`Rating: ${cook.rating} of 5`}>
            {Array.from({ length: 5 }, (_, i) => (
              <FlameIcon key={i} on={i < cook.rating} />
            ))}
          </div>
          <span className="chip">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 8.7l5.4-.8z" />
            </svg>
            <span>{cook.achievement}</span>
          </span>
        </div>

        <div className="foot">
          <div className="who">
            {cook.pitmaster}
            <span>Pitmaster</span>
          </div>
          <div className="when">
            {cook.cookTimeLong}
            <span>{cook.date}</span>
          </div>
        </div>
      </div>
    </article>
  );
});

export default ShareCard;
