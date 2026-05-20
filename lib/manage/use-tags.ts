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
// Tags rarely change mid-session; call invalidateTagsCache() from any code that
// creates/renames/deletes tags server-side to force a refresh on the next mount.
let cached: string[] | null = null;
let inflight: Promise<string[]> | null = null;
const subscribers = new Set<() => void>();

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

export function invalidateTagsCache(): void {
  cached = null;
  inflight = null;
  for (const fn of subscribers) fn();
}

/**
 * Fetches the universe of tags currently in use. Caches at module scope (tags rarely
 * change while a session is open). Returns `unavailable` on 404 so callers can degrade
 * to free-text entry while the backend endpoint isn't deployed yet.
 */
export function useTags(): State {
  const [state, setState] = useState<State>(() => (cached ? { status: "ready", tags: cached } : { status: "loading" }));

  useEffect(() => {
    let cancelled = false;
    function load() {
      setState(cached ? { status: "ready", tags: cached } : { status: "loading" });
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
    }
    load();
    subscribers.add(load);
    return () => {
      cancelled = true;
      subscribers.delete(load);
    };
  }, []);

  return state;
}
