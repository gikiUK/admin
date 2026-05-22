"use client";

import { useQuery } from "@tanstack/react-query";
import type { CohortSpec } from "@/lib/analytics/insights/cohort-spec";
import type { CohortSummary } from "@/lib/analytics/insights/insights-api";
import { cohortSummaryQuery, type InsightsState, toInsightsState } from "@/lib/analytics/insights/queries";

export function useCohortSummary(spec: CohortSpec): InsightsState<CohortSummary> {
  const query = useQuery(cohortSummaryQuery(spec));
  return toInsightsState(query);
}
