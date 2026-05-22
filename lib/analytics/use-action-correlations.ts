"use client";

import { useQuery } from "@tanstack/react-query";
import type { ActionCorrelations, ActionKind } from "@/lib/analytics/actions-api";
import { actionCorrelationsQuery } from "@/lib/analytics/queries";
import { type InsightsState, toInsightsState } from "@/lib/query/insights-state";

export function useActionCorrelations(
  from: string,
  to: string,
  kind: ActionKind = "both"
): InsightsState<ActionCorrelations> {
  const query = useQuery(actionCorrelationsQuery(from, to, kind));
  return toInsightsState(query);
}
