import type { ActionLeaderboardRow } from "@/lib/analytics/actions-api";
import type { AnalyticsOrganization } from "@/lib/analytics/api";
import type { CohortSpec } from "@/lib/analytics/insights/cohort-spec";
import { apiFetch } from "@/lib/api/client";

export type CohortSummary = {
  cohort_size: number;
  total_orgs_in_db: number;
  tier_breakdown: { standard: number; premium: number };
  tracked_actions: { total: number; avg_per_org: number; median_per_org: number };
  with_any_actions: number;
  with_completed_actions: number;
  // Full enriched org rows, populated by the backend only when cohort_size <= 6; omitted otherwise.
  members?: AnalyticsOrganization[];
};

export type FactBreakdownValue = {
  value: string | number | boolean | null;
  count: number;
  share: number;
};

export type FactBreakdown = {
  key: string;
  type: "single_select" | "multi_select";
  note: string | null;
  values: FactBreakdownValue[];
};

export type FactsBreakdownResponse = {
  cohort_size: number;
  breakdowns: FactBreakdown[];
};

export function fetchCohortSummary(spec: CohortSpec): Promise<CohortSummary> {
  return apiFetch<CohortSummary>("/admin/analytics/insights/cohort_summary", {
    method: "POST",
    body: JSON.stringify(spec)
  });
}

export function fetchFactsBreakdown(spec: CohortSpec, factKeys: string[]): Promise<FactsBreakdownResponse> {
  return apiFetch<FactsBreakdownResponse>("/admin/analytics/insights/facts/breakdown", {
    method: "POST",
    body: JSON.stringify({ ...spec, fact_keys: factKeys })
  });
}

export type PreGikiFilter = "all" | "already_doing" | "previously_done" | "none";

export type PlanBreakdownOptions = {
  metadata_keys: string[];
  include_custom?: boolean;
  pre_giki_filter?: PreGikiFilter;
  status_filter?: string[];
};

export type PlanBreakdownValue = {
  value: string | number | boolean | null;
  count: number;
  share: number;
};

export type PlanBreakdown = {
  key: string;
  type: "single_select" | "multi_select";
  note: string | null;
  total_with_metadata: number;
  missing_metadata: number;
  values: PlanBreakdownValue[];
};

export type PlanBreakdownResponse = {
  cohort_size: number;
  filters: {
    include_custom: boolean;
    pre_giki_filter: PreGikiFilter;
    status_filter: string[] | null;
  };
  kpis: {
    total_actions: number;
    avg_actions_per_org: number;
    total_recommendations: number | null;
    actions_by_status: Record<string, number>;
  };
  breakdowns: PlanBreakdown[];
};

export function fetchPlanBreakdown(spec: CohortSpec, opts: PlanBreakdownOptions): Promise<PlanBreakdownResponse> {
  return apiFetch<PlanBreakdownResponse>("/admin/analytics/insights/plan/breakdown", {
    method: "POST",
    body: JSON.stringify({ ...spec, ...opts })
  });
}

export type PlanPopularActionsOptions = {
  include_custom?: boolean;
  pre_giki_filter?: PreGikiFilter;
  status_filter?: string[];
  limit?: number;
};

export type PlanPopularActionsResponse = {
  cohort_size: number;
  filters: {
    include_custom: boolean;
    pre_giki_filter: PreGikiFilter;
    status_filter: string[] | null;
  };
  actions: ActionLeaderboardRow[];
};

export function fetchPlanPopularActions(
  spec: CohortSpec,
  opts: PlanPopularActionsOptions
): Promise<PlanPopularActionsResponse> {
  return apiFetch<PlanPopularActionsResponse>("/admin/analytics/insights/plan/popular_actions", {
    method: "POST",
    body: JSON.stringify({ ...spec, ...opts })
  });
}
