import type { CohortSpec } from "@/lib/analytics/insights/cohort-spec";
import {
  type CohortSummary,
  type FactsBreakdownResponse,
  fetchCohortSummary,
  fetchFactsBreakdown,
  fetchPlanBreakdown,
  type PlanBreakdownOptions,
  type PlanBreakdownResponse
} from "@/lib/analytics/insights/insights-api";

export const insightsKeys = {
  all: ["insights"] as const,
  cohortSummary: (spec: CohortSpec) => ["insights", "cohort-summary", spec] as const,
  factsBreakdown: (spec: CohortSpec, factKeys: string[]) => ["insights", "facts-breakdown", spec, factKeys] as const,
  planBreakdown: (spec: CohortSpec, opts: PlanBreakdownOptions) => ["insights", "plan-breakdown", spec, opts] as const
};

export function cohortSummaryQuery(spec: CohortSpec) {
  return {
    queryKey: insightsKeys.cohortSummary(spec),
    queryFn: () => fetchCohortSummary(spec)
  };
}

export function factsBreakdownQuery(spec: CohortSpec, factKeys: string[]) {
  return {
    queryKey: insightsKeys.factsBreakdown(spec, factKeys),
    queryFn: () => fetchFactsBreakdown(spec, factKeys)
  };
}

export function planBreakdownQuery(spec: CohortSpec, opts: PlanBreakdownOptions) {
  return {
    queryKey: insightsKeys.planBreakdown(spec, opts),
    queryFn: () => fetchPlanBreakdown(spec, opts)
  };
}

export { type InsightsState, isPendingBackendError, toInsightsState } from "@/lib/query/insights-state";

// Convenience accessors used to satisfy strict type narrowing in tests / consumers.
export type { CohortSummary, FactsBreakdownResponse, PlanBreakdownResponse };
