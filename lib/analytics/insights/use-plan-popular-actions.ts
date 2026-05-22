"use client";

import { useQuery } from "@tanstack/react-query";
import type { CohortSpec } from "@/lib/analytics/insights/cohort-spec";
import type { PlanPopularActionsOptions, PlanPopularActionsResponse } from "@/lib/analytics/insights/insights-api";
import { type InsightsState, planPopularActionsQuery, toInsightsState } from "@/lib/analytics/insights/queries";

export function usePlanPopularActions(
  spec: CohortSpec,
  opts: PlanPopularActionsOptions
): InsightsState<PlanPopularActionsResponse> {
  const query = useQuery(planPopularActionsQuery(spec, opts));
  return toInsightsState(query);
}
