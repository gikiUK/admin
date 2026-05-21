"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// SSR-safe persisted string[] state. On first render (server + first client paint)
// we return `defaults` so hydration matches; in an effect we hydrate from LS.
// An empty stored array is preserved (user removed all keys) — only missing/invalid
// entries fall back to defaults.
export function usePersistentKeys(storageKey: string, defaults: string[]): [string[], (next: string[]) => void] {
  const [keys, setKeysState] = useState<string[]>(defaults);
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw === null) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.every((k) => typeof k === "string")) {
        setKeysState(parsed);
      }
    } catch {
      // Corrupted JSON / disabled storage — keep defaults.
    }
  }, [storageKey]);

  const setKeys = useCallback(
    (next: string[]) => {
      setKeysState(next);
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // Quota / disabled storage — UI still works, just won't persist.
      }
    },
    [storageKey]
  );

  return [keys, setKeys];
}
