import { atomWithStorage } from "jotai/utils";

// Shared by the public player and editor; storage failure still allows in-memory volume changes.
export const volumeAtom = atomWithStorage<number>("loudasobi_volume", 1, {
  getItem(key, initialValue) {
    try {
      const value: unknown = JSON.parse(localStorage.getItem(key) ?? "null");
      return typeof value === "number" &&
        Number.isFinite(value) &&
        value >= 0 &&
        value <= 1
        ? value
        : initialValue;
    } catch {
      return initialValue;
    }
  },
  setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage may be blocked or full; the atom retains the current value.
    }
  },
  removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Resetting the in-memory value must not depend on storage access.
    }
  },
});
