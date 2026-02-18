import type { ChangeEntry } from "./change-log";
import type { DatasetData } from "./types";

export type HistoryState = {
  /** All entries in the timeline. entries[0..cursor] are applied, entries[cursor+1..] are undone. */
  entries: ChangeEntry[];
  /** Index of the last applied entry. -1 means nothing applied (at the beginning). */
  cursor: number;
  /** The base snapshot that entries replay from. Captured when the first entry is added. */
  base: DatasetData | null;
};

export const emptyHistory: HistoryState = { entries: [], cursor: -1, base: null };

// ── localStorage persistence ─────────────────────────────

const STORAGE_KEY = "giki-history";

type PersistedHistory = { entries: ChangeEntry[]; cursor: number; base: DatasetData | null };

export function saveHistory(history: HistoryState): void {
  try {
    const data: PersistedHistory = { entries: history.entries, cursor: history.cursor, base: history.base };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Quota exceeded or unavailable — silently ignore
  }
}

export function loadHistory(): HistoryState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as PersistedHistory;
    if (!Array.isArray(data.entries) || typeof data.cursor !== "number") return null;
    return { entries: data.entries, cursor: data.cursor, base: data.base ?? null };
  } catch {
    return null;
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silently ignore
  }
}
