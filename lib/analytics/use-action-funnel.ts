"use client";

import { useQuery } from "@tanstack/react-query";
import type { ActionFunnel, ActionKind } from "@/lib/analytics/actions-api";
import { actionFunnelQuery } from "@/lib/analytics/queries";
import { type InsightsState, toInsightsState } from "@/lib/query/insights-state";

export function useActionFunnel(from: string, to: string, kind: ActionKind = "both"): InsightsState<ActionFunnel> {
  const query = useQuery(actionFunnelQuery(from, to, kind));
  return toInsightsState(query);
}
