import {
  type ActionKind,
  fetchActionCorrelations,
  fetchActionFunnel,
  fetchActionLeaderboard,
  fetchActionTrends
} from "@/lib/analytics/actions-api";
import { fetchOrganizationActivity, fetchSummary } from "@/lib/analytics/api";

export const analyticsKeys = {
  all: ["analytics"] as const,
  summary: (from: string, to: string) => ["analytics", "summary", from, to] as const,
  actionCorrelations: (from: string, to: string, kind: ActionKind) =>
    ["analytics", "action-correlations", from, to, kind] as const,
  actionFunnel: (from: string, to: string, kind: ActionKind) => ["analytics", "action-funnel", from, to, kind] as const,
  actionLeaderboard: (from: string, to: string, kind: ActionKind) =>
    ["analytics", "action-leaderboard", from, to, kind] as const,
  actionTrends: (weeks: number, kind: ActionKind) => ["analytics", "action-trends", weeks, kind] as const,
  organizationActivity: (slug: string, from: string, to: string) =>
    ["analytics", "organization-activity", slug, from, to] as const
};

export function summaryQuery(from: string, to: string) {
  return { queryKey: analyticsKeys.summary(from, to), queryFn: () => fetchSummary(from, to) };
}

export function actionCorrelationsQuery(from: string, to: string, kind: ActionKind) {
  return {
    queryKey: analyticsKeys.actionCorrelations(from, to, kind),
    queryFn: () => fetchActionCorrelations({ from, to, kind })
  };
}

export function actionFunnelQuery(from: string, to: string, kind: ActionKind) {
  return {
    queryKey: analyticsKeys.actionFunnel(from, to, kind),
    queryFn: () => fetchActionFunnel({ from, to, kind })
  };
}

export function actionLeaderboardQuery(from: string, to: string, kind: ActionKind) {
  return {
    queryKey: analyticsKeys.actionLeaderboard(from, to, kind),
    queryFn: () => fetchActionLeaderboard({ from, to, kind })
  };
}

export function actionTrendsQuery(weeks: number, kind: ActionKind) {
  return {
    queryKey: analyticsKeys.actionTrends(weeks, kind),
    queryFn: () => fetchActionTrends({ weeks, kind })
  };
}

export function organizationActivityQuery(slug: string, from: string, to: string) {
  return {
    queryKey: analyticsKeys.organizationActivity(slug, from, to),
    queryFn: () => fetchOrganizationActivity(slug, from, to)
  };
}
