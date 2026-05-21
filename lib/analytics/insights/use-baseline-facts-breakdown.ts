"use client";

import { useEffect, useState } from "react";
import { DEFAULT_COHORT_SPEC } from "@/lib/analytics/insights/cohort-spec";
import { type FactsBreakdownResponse, fetchFactsBreakdown } from "@/lib/analytics/insights/insights-api";
import { ApiError } from "@/lib/api/client";

type State =
  | { status: "loading" }
  | { status: "ready"; data: FactsBreakdownResponse }
  | { status: "pending-backend" }
  | { status: "error"; message: string };

/**
 * Fetches the breakdown over the *baseline* cohort (all orgs, no fact filters) so the
 * Facts insights page can overlay "all orgs" as a comparison behind cohort bars.
 * Uses DEFAULT_COHORT_SPEC (an empty cohort = every org) as the baseline.
 */
export function useBaselineFactsBreakdown(factKeys: string[]): State {
  const [state, setState] = useState<State>({ status: "loading" });
  const key = JSON.stringify(factKeys);

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-run on serialized factKeys only
  useEffect(() => {
    let cancelled = false;
    if (factKeys.length === 0) {
      setState({ status: "ready", data: { cohort_size: 0, breakdowns: [] } });
      return;
    }
    setState({ status: "loading" });
    fetchFactsBreakdown(DEFAULT_COHORT_SPEC, factKeys)
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
            message: err instanceof Error ? err.message : "Failed to load baseline"
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  return state;
}
