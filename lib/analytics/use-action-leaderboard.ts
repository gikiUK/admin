"use client";

import { useQuery } from "@tanstack/react-query";
import type { ActionKind, ActionLeaderboard } from "@/lib/analytics/actions-api";
import { actionLeaderboardQuery } from "@/lib/analytics/queries";
import { type InsightsState, toInsightsState } from "@/lib/query/insights-state";

export function useActionLeaderboard(
  from: string,
  to: string,
  kind: ActionKind = "both"
): InsightsState<ActionLeaderboard> {
  const query = useQuery(actionLeaderboardQuery(from, to, kind));
  return toInsightsState(query);
}
