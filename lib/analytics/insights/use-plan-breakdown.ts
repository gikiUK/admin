"use client";

import { useQuery } from "@tanstack/react-query";
import type { CohortSpec } from "@/lib/analytics/insights/cohort-spec";
import type { PlanBreakdownOptions, PlanBreakdownResponse } from "@/lib/analytics/insights/insights-api";
import { type InsightsState, planBreakdownQuery, toInsightsState } from "@/lib/analytics/insights/queries";

export function usePlanBreakdown(spec: CohortSpec, opts: PlanBreakdownOptions): InsightsState<PlanBreakdownResponse> {
  const query = useQuery(planBreakdownQuery(spec, opts));
  return toInsightsState(query);
}
