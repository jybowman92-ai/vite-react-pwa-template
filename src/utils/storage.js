// Safe localStorage wrappers - never throw, track quota errors.
// Use safeGet/safeSet/safeRemove everywhere instead of calling localStorage directly.

let _overQuota = false;
export const isStorageOverQuota = () => _overQuota;

export const safeGet = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
export const safeSet = (k, v) => {
  try {
    localStorage.setItem(k, v);
    _overQuota = false;
  } catch (e) {
    if (e?.name === "QuotaExceededError" || e?.code === 22 || e?.name === "NS_ERROR_DOM_QUOTA_REACHED") {
      _overQuota = true;
    }
  }
};
export const safeRemove = (k) => { try { localStorage.removeItem(k); } catch {} };

// JSON-aware wrappers — never throw, fall back on parse errors.
export const safeGetJSON = (k, fallback) => {
  const raw = safeGet(k);
  if (raw == null) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
};
export const safeSetJSON = (k, v) => safeSet(k, JSON.stringify(v));

// localStorage key constants, kept here so they're never typo'd.
export const GW_COOKS_KEY    = "gw_cooks";          // the cook log (array of entries)
export const GW_SELECTED_KEY = "gw_selected_cook";  // id of the cook being shared
export const GW_PRO_KEY      = "gw_pro";            // "1" when Pro is unlocked (debug)
