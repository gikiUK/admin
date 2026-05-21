import { apiFetch, buildQuery } from "@/lib/api/client";

export const ACTION_KINDS = ["both", "system", "custom"] as const;
export type ActionKind = (typeof ACTION_KINDS)[number];

export type ActionLeaderboardRow = {
  action_id: number;
  action_type: "Action" | "Company::CustomAction";
  title: string | null;
  category: string | null;
  theme: string | null;
  sector: string[];
  adoption_count: number;
  completion_count: number;
  completion_rate: number;
  stale_count: number;
  median_time_to_complete_days: number | null;
  tracked_total: number;
  assignee_coverage: number;
  due_date_coverage: number;
  notes_coverage: number;
};

export type ActionLeaderboard = {
  range: { from: string; to: string };
  filters: { kind: ActionKind; tier: string | null };
  actions: ActionLeaderboardRow[];
};

export type LeaderboardFilter = {
  from: string;
  to: string;
  kind?: ActionKind;
  tier?: string;
};

export function fetchActionLeaderboard(filter: LeaderboardFilter): Promise<ActionLeaderboard> {
  return apiFetch<ActionLeaderboard>(`/admin/analytics/actions${buildQuery(filter)}`);
}

export type FunnelNodeId =
  | "created"
  | "in_progress"
  | "completed"
  | "archived"
  | "rejected"
  | "deleted"
  | "active"
  | "stale"
  | "not_progressed";

export type FunnelNode = { id: FunnelNodeId; label: string };
export type FunnelEdge = { from: FunnelNodeId; to: FunnelNodeId; count: number };

export type FunnelHistogramBucket = {
  range: string;
  lower_days: number;
  upper_days: number | null;
  count: number;
};

export type FunnelDurationStats = {
  n: number;
  median_days: number | null;
  p90_days: number | null;
  histogram: FunnelHistogramBucket[];
};

export type ActionFunnel = {
  range: { from: string; to: string };
  filters: { kind: ActionKind; tier: string | null };
  kpis: {
    created: number;
    reached_in_progress: number;
    completed: number;
    completion_rate: number;
    median_time_to_complete_days: number | null;
  };
  nodes: FunnelNode[];
  edges: FunnelEdge[];
  durations: {
    created_to_in_progress: FunnelDurationStats;
    in_progress_to_completed: FunnelDurationStats;
    created_to_completed: FunnelDurationStats;
  };
};

export function fetchActionFunnel(filter: LeaderboardFilter): Promise<ActionFunnel> {
  return apiFetch<ActionFunnel>(`/admin/analytics/actions/funnel${buildQuery(filter)}`);
}

export type ActionCorrelationFactor = {
  factor: string;
  label: string;
  with: { n: number; completion_rate: number };
  without: { n: number; completion_rate: number };
  lift: number | null;
  ci_low: number | null;
  ci_high: number | null;
  insufficient_data: boolean;
};

export type ActionCorrelations = {
  range: { from: string; to: string };
  filters: { kind: ActionKind; tier: string | null };
  total_sample: number;
  factors: ActionCorrelationFactor[];
};

export function fetchActionCorrelations(filter: LeaderboardFilter): Promise<ActionCorrelations> {
  return apiFetch<ActionCorrelations>(`/admin/analytics/actions/correlations${buildQuery(filter)}`);
}

export type ActionTrendRow = {
  action_id: number;
  action_type: "Action" | "Company::CustomAction";
  title: string | null;
  theme: string | null;
  counts: number[];
  total: number;
  slope: number;
};

export type ActionTrends = {
  weeks: number;
  bucket_starts: string[];
  actions: ActionTrendRow[];
};

export type TrendsFilter = {
  weeks?: number;
  kind?: ActionKind;
  tier?: string;
};

export function fetchActionTrends(filter: TrendsFilter = {}): Promise<ActionTrends> {
  return apiFetch<ActionTrends>(`/admin/analytics/actions/trends${buildQuery(filter)}`);
}
