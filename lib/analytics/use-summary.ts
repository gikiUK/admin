"use client";

import { useEffect, useState } from "react";
import { type AnalyticsSummary, fetchSummary } from "@/lib/analytics/api";
import { ApiError } from "@/lib/api/client";

type SummaryState =
  | { status: "loading" }
  | { status: "ready"; data: AnalyticsSummary }
  | { status: "pending-backend" }
  | { status: "error"; message: string };

export function useSummary(from: string, to: string): SummaryState {
  const [state, setState] = useState<SummaryState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    fetchSummary(from, to)
      .then((data) => {
        if (!cancelled) setState({ status: "ready", data });
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.isNotFound()) {
          setState({ status: "pending-backend" });
        } else {
          setState({ status: "error", message: err instanceof Error ? err.message : "Failed to load summary" });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [from, to]);

  return state;
}
