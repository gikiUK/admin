"use client";

import { useEffect, useState } from "react";
import { fetchSummary } from "@/lib/analytics/api";
import { ApiError } from "@/lib/api/client";

type RawPoint = { date: string; by_type: Record<string, number> };

type State = { status: "idle" } | { status: "loading" } | { status: "ready"; data: RawPoint[] } | { status: "error" };

export function usePreviousSeries(from: string, to: string, enabled: boolean): State {
  const [state, setState] = useState<State>({ status: enabled ? "loading" : "idle" });

  useEffect(() => {
    if (!enabled) {
      setState({ status: "idle" });
      return;
    }
    let cancelled = false;
    setState({ status: "loading" });
    fetchSummary(from, to)
      .then((data) => {
        if (cancelled) return;
        setState({ status: "ready", data: data.events_over_time_by_type ?? [] });
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.isNotFound()) {
          setState({ status: "ready", data: [] });
        } else {
          setState({ status: "error" });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [from, to, enabled]);

  return state;
}
