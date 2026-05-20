"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { fetchTags } from "@/lib/manage/api";

type State =
  | { status: "loading" }
  | { status: "ready"; tags: string[] }
  | { status: "unavailable" }
  | { status: "error"; message: string };

// Module-level cache so multiple TagPickers on the same page share one request.
let cached: string[] | null = null;
let inflight: Promise<string[]> | null = null;

function loadTags(): Promise<string[]> {
  if (cached) return Promise.resolve(cached);
  if (!inflight) {
    inflight = fetchTags()
      .then((res) => {
        cached = res.tags;
        return res.tags;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

/**
 * Fetches the universe of tags currently in use. Caches at module scope (tags rarely
 * change while a session is open). Returns `unavailable` on 404 so callers can degrade
 * to free-text entry while the backend endpoint isn't deployed yet.
 */
export function useTags(): State {
  const [state, setState] = useState<State>(() => (cached ? { status: "ready", tags: cached } : { status: "loading" }));

  useEffect(() => {
    if (cached) return;
    let cancelled = false;
    loadTags()
      .then((tags) => {
        if (!cancelled) setState({ status: "ready", tags });
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.isNotFound()) {
          setState({ status: "unavailable" });
        } else {
          setState({ status: "error", message: err instanceof Error ? err.message : "Failed to load tags" });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
