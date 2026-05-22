"use client";

import { useQuery } from "@tanstack/react-query";
import type { AnalyticsSummary } from "@/lib/analytics/api";
import { summaryQuery } from "@/lib/analytics/queries";
import { type InsightsState, toInsightsState } from "@/lib/query/insights-state";

export function useSummary(from: string, to: string): InsightsState<AnalyticsSummary> {
  const query = useQuery(summaryQuery(from, to));
  return toInsightsState(query);
}
