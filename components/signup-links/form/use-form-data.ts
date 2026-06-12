import { useEffect, useState } from "react";
import { fetchCompanyCohorts, fetchFeatureFlagCatalogue, fetchReferrers } from "@/lib/signup-links/related-api";
import type { SignupLinkReferrer } from "@/lib/signup-links/types";
import { fetchCompanyTags, type TagWithCount } from "@/lib/tags/api";

type State<T> = { status: "loading" } | { status: "ready"; value: T } | { status: "error"; message: string };

function buildLoader<T>(fetcher: () => Promise<T>) {
  let cached: T | null = null;
  let inflight: Promise<T> | null = null;
  const subscribers = new Set<() => void>();

  function load(): Promise<T> {
    if (cached !== null) return Promise.resolve(cached);
    if (!inflight) {
      inflight = fetcher()
        .then((value) => {
          cached = value;
          return value;
        })
        .finally(() => {
          inflight = null;
        });
    }
    return inflight;
  }

  function invalidate() {
    cached = null;
    inflight = null;
    for (const sub of subscribers) sub();
  }

  function useLoader(): State<T> {
    const [state, setState] = useState<State<T>>(() =>
      cached !== null ? { status: "ready", value: cached } : { status: "loading" }
    );

    useEffect(() => {
      let cancelled = false;
      function run() {
        setState(cached !== null ? { status: "ready", value: cached } : { status: "loading" });
        load()
          .then((value) => {
            if (!cancelled) setState({ status: "ready", value });
          })
          .catch((err) => {
            if (cancelled) return;
            setState({ status: "error", message: err instanceof Error ? err.message : "Failed to load" });
          });
      }
      run();
      subscribers.add(run);
      return () => {
        cancelled = true;
        subscribers.delete(run);
      };
    }, []);

    return state;
  }

  return Object.assign(useLoader, { invalidate });
}

export const useFeatureFlagCatalogue = buildLoader<string[]>(() =>
  fetchFeatureFlagCatalogue().then((r) => r.feature_flags)
);

export const useReferrers = buildLoader<SignupLinkReferrer[]>(() => fetchReferrers().then((r) => r.referrers));

export const useCompanyTagUniverse = buildLoader<TagWithCount[]>(() => fetchCompanyTags().then((r) => r.company_tags));

export const useCompanyCohortUniverse = buildLoader<TagWithCount[]>(() => fetchCompanyCohorts().then((r) => r.cohorts));
