"use client";

import { useQuery } from "@tanstack/react-query";
import type { ActionKind, ActionTrends } from "@/lib/analytics/actions-api";
import { actionTrendsQuery } from "@/lib/analytics/queries";
import { type InsightsState, toInsightsState } from "@/lib/query/insights-state";

export function useActionTrends(weeks: number, kind: ActionKind = "both"): InsightsState<ActionTrends> {
  const query = useQuery(actionTrendsQuery(weeks, kind));
  return toInsightsState(query);
}
