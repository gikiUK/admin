"use client";

import { useEffect, useState } from "react";
import type { CohortSpec } from "@/lib/analytics/insights/cohort-spec";
import {
  fetchPlanBreakdown,
  type PlanBreakdownOptions,
  type PlanBreakdownResponse
} from "@/lib/analytics/insights/insights-api";
import { ApiError } from "@/lib/api/client";

type State =
  | { status: "loading" }
  | { status: "ready"; data: PlanBreakdownResponse }
  | { status: "pending-backend" }
  | { status: "error"; message: string };

export function usePlanBreakdown(spec: CohortSpec, opts: PlanBreakdownOptions): State {
  const [state, setState] = useState<State>({ status: "loading" });
  const key = JSON.stringify({ spec, opts });

  // biome-ignore lint/correctness/useExhaustiveDependencies: `key` is the JSON-stringified payload
  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    fetchPlanBreakdown(spec, opts)
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
            message: err instanceof Error ? err.message : "Failed to load plan breakdown"
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  return state;
}
