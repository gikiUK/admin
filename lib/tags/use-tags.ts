"use client";

import { useEffect, useState } from "react";
import { fetchCompanyTags, type TagWithCount } from "@/lib/tags/api";

export type TagsState =
  | { status: "loading" }
  | { status: "ready"; tags: TagWithCount[] }
  | { status: "error"; message: string };

let cached: TagWithCount[] | null = null;
let inflight: Promise<TagWithCount[]> | null = null;
const subscribers = new Set<() => void>();

function loadTags(): Promise<TagWithCount[]> {
  if (cached) return Promise.resolve(cached);
  if (!inflight) {
    inflight = fetchCompanyTags()
      .then((res) => {
        cached = res.company_tags;
        return res.company_tags;
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

export function useTags(): TagsState {
  const [state, setState] = useState<TagsState>(() =>
    cached ? { status: "ready", tags: cached } : { status: "loading" }
  );

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
          setState({ status: "error", message: err instanceof Error ? err.message : "Failed to load tags" });
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
