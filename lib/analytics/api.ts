import { apiFetch, buildQuery, type Paginated } from "@/lib/api/client";

export type AnalyticsEvent = {
  id: number;
  action_type: string;
  created_at: string;
  details: Record<string, unknown>;
  user: { id: number; name: string } | null;
  company: { id: number; name: string } | null;
};

export type EventsFilter = {
  action_type?: string;
  company_id?: string;
  user_id?: string;
  order?: "newest" | "oldest";
  page?: number;
  per?: number;
};

export type AnalyticsSummary = {
  range: { from: string; to: string };
  active_users: { dau: number; wau: number; mau: number };
  active_orgs: number;
  new_signups: number;
  new_companies: number;
  tracked_actions_added: number;
  tracked_actions_completed: number;
  avg_completion_rate: number;
  status_distribution: Record<string, number>;
  top_completed_action_types: Array<{ action_type: string; count: number }>;
  at_risk_orgs: Array<{
    company_id: number;
    company_name: string;
    last_activity_at: string | null;
    not_started_count: number;
  }>;
  events_over_time?: Array<{ date: string; count: number }>;
  top_action_types?: Array<{ action_type: string; count: number }>;
};

export function fetchEvents(filter: EventsFilter): Promise<Paginated<AnalyticsEvent>> {
  return apiFetch<Paginated<AnalyticsEvent>>(`/admin/analytics_events${buildQuery(filter)}`);
}

export function fetchSummary(from: string, to: string): Promise<AnalyticsSummary> {
  return apiFetch<AnalyticsSummary>(`/admin/analytics/summary${buildQuery({ from, to })}`);
}
