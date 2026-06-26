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

// TODO: define your localStorage key constants here so they're never typo'd.
// Example:
// export const SETTINGS_KEY = "myapp_settings";
// export const LOG_KEY      = "myapp_log";
