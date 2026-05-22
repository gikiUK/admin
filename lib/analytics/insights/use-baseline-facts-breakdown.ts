"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { DEFAULT_COHORT_SPEC } from "@/lib/analytics/insights/cohort-spec";
import type { FactsBreakdownResponse } from "@/lib/analytics/insights/insights-api";
import { factsBreakdownQuery, type InsightsState, toInsightsState } from "@/lib/analytics/insights/queries";

const EMPTY: FactsBreakdownResponse = { cohort_size: 0, breakdowns: [] };

/**
 * Fetches the breakdown over the *baseline* cohort (all orgs, no fact filters) so the
 * Facts insights page can overlay "all orgs" as a comparison behind cohort bars.
 * Cached longer than per-cohort breakdowns since the inputs are global.
 */
export function useBaselineFactsBreakdown(factKeys: string[]): InsightsState<FactsBreakdownResponse> {
  const query = useQuery({
    ...factsBreakdownQuery(DEFAULT_COHORT_SPEC, factKeys),
    enabled: factKeys.length > 0,
    staleTime: 5 * 60_000,
    placeholderData: keepPreviousData
  });
  return toInsightsState(query, EMPTY);
}
