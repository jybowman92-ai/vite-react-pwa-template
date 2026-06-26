// Every fontSize in this app goes through fs(n) instead of a bare number so
// the single --text-scale CSS variable controls all text sizes in one place.
export const fs = (n) => `calc(${n}px * var(--text-scale))`;

// HH:MM:SS from seconds
export const fmt = (s) =>
  [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60]
    .map((n) => String(n).padStart(2, "0")).join(":");

// "Xh Ym" from seconds
export const fmtHM = (secs) => {
  if (!secs) return "0m";
  const h = Math.floor(secs / 3600);
  const m = Math.round((secs % 3600) / 60);
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  return `${m}m`;
};

// "3:45 PM" from timestamp ms
export const fmtClock = (ms) => {
  const d = new Date(ms);
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ap}`;
};

// "Today" / "Tomorrow" / "Mon, Jun 3" from timestamp ms
export const dayLabel = (ms) => {
  const d = new Date(ms);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tom = new Date(today); tom.setDate(today.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  if (d.getTime() === today.getTime()) return "Today";
  if (d.getTime() === tom.getTime())   return "Tomorrow";
  return new Date(ms).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
};

// "3 days ago" / "yesterday" / "today" from ISO date string
export const daysAgoLabel = (isoStr) => {
  if (!isoStr) return null;
  const then = new Date(isoStr); then.setHours(0, 0, 0, 0);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const days = Math.round((today.getTime() - then.getTime()) / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7)  return `${days} days ago`;
  if (days < 30) { const w = Math.round(days / 7);  return `${w} week${w === 1 ? "" : "s"} ago`; }
  if (days < 365){ const mo = Math.round(days / 30); return `${mo} month${mo === 1 ? "" : "s"} ago`; }
  const y = Math.round(days / 365); return `${y} year${y === 1 ? "" : "s"} ago`;
};
