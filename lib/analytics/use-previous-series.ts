"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchSummary } from "@/lib/analytics/api";
import { ApiError } from "@/lib/api/client";

type RawPoint = { date: string; by_type: Record<string, number> };

type State = { status: "idle" } | { status: "loading" } | { status: "ready"; data: RawPoint[] } | { status: "error" };

export function usePreviousSeries(from: string, to: string, enabled: boolean): State {
  const query = useQuery({
    queryKey: ["analytics", "summary", "previous", from, to] as const,
    queryFn: async () => {
      try {
        const data = await fetchSummary(from, to);
        return data.events_over_time_by_type ?? [];
      } catch (err) {
        if (err instanceof ApiError && err.isNotFound()) return [] as RawPoint[];
        throw err;
      }
    },
    enabled
  });

  if (!enabled) return { status: "idle" };
  if (query.isError) return { status: "error" };
  if (query.data !== undefined) return { status: "ready", data: query.data };
  return { status: "loading" };
}
