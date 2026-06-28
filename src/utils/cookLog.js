import {
  PW_COOKS_KEY,
  PW_SELECTED_KEY,
  safeGet,
  safeSet,
  safeGetJSON,
  safeSetJSON,
} from "./storage";

// ============================================================
//  THE COOK LOG
//  Each entry is one finished cook. In a real app these come
//  from the user's logged cooks; here we seed the log with a
//  couple of sample entries on first run, then read/write it
//  through localStorage so selections survive a reload.
// ============================================================
export const SAMPLE_COOKS = [
  {
    id: "brisket-0620",
    cut: "Brisket",
    category: "Beef",
    wood: "Post Oak",
    descriptor: "Packer · 14.2 lb · 225°F pit",
    cookTime: "14:20",
    cookTimeLong: "14h 20m low & slow",
    pulledTemp: 203,
    woodShort: "Oak",
    rating: 5,
    achievement: "Stall Conquered",
    pitmaster: "Jeremy",
    date: "JUN 2026",
    curve: [58, 86, 118, 140, 151, 154, 155, 156, 158, 164, 176, 190, 203],
  },
  {
    id: "ribs-0614",
    cut: "Spare Ribs",
    category: "Pork",
    wood: "Hickory",
    descriptor: "St. Louis · 3.4 lb · 250°F pit",
    cookTime: "05:30",
    cookTimeLong: "5h 30m · 3-2-1",
    pulledTemp: 198,
    woodShort: "Hick",
    rating: 4,
    achievement: "Bark Bandit",
    pitmaster: "Jeremy",
    date: "JUN 2026",
    curve: [54, 92, 124, 150, 162, 168, 170, 171, 175, 184, 192, 198],
  },
];

// Load the cook log, seeding it with the samples on first run.
export function loadCooks() {
  const stored = safeGetJSON(PW_COOKS_KEY, null);
  if (Array.isArray(stored) && stored.length) return stored;
  safeSetJSON(PW_COOKS_KEY, SAMPLE_COOKS);
  return SAMPLE_COOKS;
}

// Which cook is currently selected for sharing (falls back to the first).
export function loadSelectedId(cooks) {
  const id = safeGet(PW_SELECTED_KEY);
  return cooks.some((c) => c.id === id) ? id : cooks[0].id;
}

export function saveSelectedId(id) {
  safeSet(PW_SELECTED_KEY, id);
}
