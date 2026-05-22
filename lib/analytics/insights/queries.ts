import type { UseQueryResult } from "@tanstack/react-query";
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
import { ApiError } from "@/lib/api/client";

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

export function isPendingBackendError(error: unknown): boolean {
  return error instanceof ApiError && error.isNotFound();
}

export type InsightsState<T> =
  | { status: "loading" }
  | { status: "ready"; data: T }
  | { status: "pending-backend" }
  | { status: "error"; message: string };

/**
 * Adapts a useQuery result into the discriminated union the insights UI consumes.
 * Disabled queries (`isPending && !isFetching`) are treated as the synthetic
 * "ready" payload supplied by the caller — that's the empty-input shortcut the
 * bespoke hooks used (e.g. factKeys.length === 0).
 */
export function toInsightsState<T>(query: UseQueryResult<T>, emptyData?: T): InsightsState<T> {
  if (query.isError) {
    if (isPendingBackendError(query.error)) return { status: "pending-backend" };
    const message = query.error instanceof Error ? query.error.message : "Failed to load";
    return { status: "error", message };
  }
  if (query.data !== undefined) return { status: "ready", data: query.data };
  if (emptyData !== undefined && !query.isFetching && !query.isPending) {
    return { status: "ready", data: emptyData };
  }
  // Disabled queries report isPending=true and isFetching=false; honor the empty fallback.
  if (emptyData !== undefined && query.fetchStatus === "idle" && query.isPending) {
    return { status: "ready", data: emptyData };
  }
  return { status: "loading" };
}

// Convenience accessors used to satisfy strict type narrowing in tests / consumers.
export type { CohortSummary, FactsBreakdownResponse, PlanBreakdownResponse };
