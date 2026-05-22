"use client";

import { useQuery } from "@tanstack/react-query";
import type { CohortSpec } from "@/lib/analytics/insights/cohort-spec";
import type { FactsBreakdownResponse } from "@/lib/analytics/insights/insights-api";
import { factsBreakdownQuery, type InsightsState, toInsightsState } from "@/lib/analytics/insights/queries";

const EMPTY: FactsBreakdownResponse = { cohort_size: 0, breakdowns: [] };

export function useFactsBreakdown(spec: CohortSpec, factKeys: string[]): InsightsState<FactsBreakdownResponse> {
  const query = useQuery({
    ...factsBreakdownQuery(spec, factKeys),
    enabled: factKeys.length > 0
  });
  return toInsightsState(query, EMPTY);
}
