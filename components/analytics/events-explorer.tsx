"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { EventFilters } from "@/components/analytics/event-filters";
import { EventsTable } from "@/components/analytics/events-table";
import { Pager } from "@/components/ui/pager";
import { type AnalyticsEvent, type EventsFilter, fetchEvents } from "@/lib/analytics/api";
import { useUrlState } from "@/lib/use-url-state";

const FILTER_KEYS = ["action_type", "company_id", "user_id", "order", "page"] as const;

function readFilter(searchParams: URLSearchParams): EventsFilter {
  const order = searchParams.get("order");
  const page = Number(searchParams.get("page") ?? 1);
  return {
    action_type: searchParams.get("action_type") ?? undefined,
    company_id: searchParams.get("company_id") ?? undefined,
    user_id: searchParams.get("user_id") ?? undefined,
    order: order === "oldest" || order === "newest" ? order : undefined,
    page: Number.isFinite(page) && page > 0 ? page : 1
  };
}

export function EventsExplorer() {
  const { searchParams, set } = useUrlState();
  const filter = useMemo(() => readFilter(searchParams), [searchParams]);

  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, total_count: 0, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetchEvents(filter)
      .then((response) => {
        setEvents(response.results);
        setMeta(response.meta);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load events"))
      .finally(() => setLoading(false));
  }, [filter]);

  const handleFilterChange = useCallback(
    (patch: Partial<EventsFilter>) => {
      set({ ...patch, page: 1 });
    },
    [set]
  );

  const handleReset = useCallback(() => {
    set(Object.fromEntries(FILTER_KEYS.map((key) => [key, undefined])));
  }, [set]);

  const handlePageChange = useCallback(
    (page: number) => {
      set({ page });
    },
    [set]
  );

  return (
    <div className="space-y-4">
      <EventFilters filter={filter} onChange={handleFilterChange} onReset={handleReset} />
      {error && <div className="text-sm text-destructive">{error}</div>}
      {loading ? <div className="text-sm text-muted-foreground">Loading events…</div> : <EventsTable events={events} />}
      <Pager
        page={meta.current_page}
        totalPages={meta.total_pages}
        totalCount={meta.total_count}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
