"use client";

import { useEffect, useState } from "react";
import type { CohortSpec } from "@/lib/analytics/insights/cohort-spec";
import { type FactsBreakdownResponse, fetchFactsBreakdown } from "@/lib/analytics/insights/insights-api";
import { ApiError } from "@/lib/api/client";

type State =
  | { status: "loading" }
  | { status: "ready"; data: FactsBreakdownResponse }
  | { status: "pending-backend" }
  | { status: "error"; message: string };

export function useFactsBreakdown(spec: CohortSpec, factKeys: string[]): State {
  const [state, setState] = useState<State>({ status: "loading" });
  const key = JSON.stringify({ spec, factKeys });

  // biome-ignore lint/correctness/useExhaustiveDependencies: `key` is the JSON-stringified payload; re-running on `spec`/`factKeys` would re-fetch on every render
  useEffect(() => {
    let cancelled = false;
    if (factKeys.length === 0) {
      setState({ status: "ready", data: { cohort_size: 0, breakdowns: [] } });
      return;
    }
    setState({ status: "loading" });
    fetchFactsBreakdown(spec, factKeys)
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
            message: err instanceof Error ? err.message : "Failed to load fact breakdowns"
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  return state;
}
