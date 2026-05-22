"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchOrganizationActivity } from "@/lib/analytics/api";
import { organizationActivityQuery } from "@/lib/analytics/queries";
import { ApiError } from "@/lib/api/client";
import { type InsightsState, toInsightsState } from "@/lib/query/insights-state";

type RawPoint = { date: string; by_type: Record<string, number> };

export function useOrgActivity(slug: string, from: string, to: string): InsightsState<RawPoint[]> {
  const query = useQuery({
    ...organizationActivityQuery(slug, from, to),
    select: (response) => response.events_over_time_by_type
  });
  return toInsightsState(query);
}

// Previous-period activity: a 404 means "no data for the prior window", which the
// chart treats as an empty series (not a backend-pending state).
export function useOrgPreviousActivity(
  slug: string,
  from: string,
  to: string,
  enabled: boolean
): InsightsState<RawPoint[]> | null {
  const query = useQuery({
    queryKey: ["analytics", "organization-activity", "previous", slug, from, to] as const,
    queryFn: async () => {
      try {
        const response = await fetchOrganizationActivity(slug, from, to);
        return response.events_over_time_by_type;
      } catch (err) {
        if (err instanceof ApiError && err.isNotFound()) return [] as RawPoint[];
        throw err;
      }
    },
    enabled
  });
  if (!enabled) return null;
  return toInsightsState(query);
}
