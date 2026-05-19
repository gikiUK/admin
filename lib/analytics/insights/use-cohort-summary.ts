"use client";

import { useEffect, useState } from "react";
import type { CohortSpec } from "@/lib/analytics/insights/cohort-spec";
import { type CohortSummary, fetchCohortSummary } from "@/lib/analytics/insights/insights-api";
import { ApiError } from "@/lib/api/client";

type State =
  | { status: "loading" }
  | { status: "ready"; data: CohortSummary }
  | { status: "pending-backend" }
  | { status: "error"; message: string };

export function useCohortSummary(spec: CohortSpec): State {
  const [state, setState] = useState<State>({ status: "loading" });
  const key = JSON.stringify(spec);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `key` is the JSON-stringified spec; re-running on `spec` would re-fetch on every render
  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    fetchCohortSummary(spec)
      .then((data) => {
        if (!cancelled) setState({ status: "ready", data });
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.isNotFound()) {
          setState({ status: "pending-backend" });
        } else {
          setState({
            status: "error",
            message: err instanceof Error ? err.message : "Failed to load cohort summary"
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  return state;
}
