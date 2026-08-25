import { useEffect, useState } from "react";

export type LoaderState<T> =
  | { status: "loading" }
  | { status: "ready"; value: T }
  | { status: "error"; message: string };

/**
 * Builds a module-level cached loader hook: the fetch runs once per page load,
 * is shared by every consumer, and can be invalidated to force a refetch.
 */
export function buildLoader<T>(fetcher: () => Promise<T>) {
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

  function useLoader(): LoaderState<T> {
    const [state, setState] = useState<LoaderState<T>>(() =>
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
