"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { EventDetailSheet } from "@/components/analytics/event-detail-sheet";
import { EventFilters } from "@/components/analytics/event-filters";
import { EventsTable } from "@/components/analytics/events-table";
import { Pager } from "@/components/ui/pager";
import type { EventsFilter } from "@/lib/analytics/api";
import { eventsQuery } from "@/lib/analytics/queries";
import { useUrlState } from "@/lib/use-url-state";

const FILTER_KEYS = [
  "action_type",
  "company_id",
  "company_label",
  "user_id",
  "user_label",
  "from",
  "to",
  "order",
  "page",
  "event"
] as const;

function readFilter(searchParams: URLSearchParams): EventsFilter {
  const order = searchParams.get("order");
  const page = Number(searchParams.get("page") ?? 1);
  return {
    action_type: searchParams.get("action_type") ?? undefined,
    company_id: searchParams.get("company_id") ?? undefined,
    company_label: searchParams.get("company_label") ?? undefined,
    user_id: searchParams.get("user_id") ?? undefined,
    user_label: searchParams.get("user_label") ?? undefined,
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
    order: order === "oldest" || order === "newest" ? order : undefined,
    page: Number.isFinite(page) && page > 0 ? page : 1
  };
}

const EMPTY_META = { current_page: 1, total_count: 0, total_pages: 1 };

export function EventsExplorer() {
  const { searchParams, set } = useUrlState();
  const filter = readFilter(searchParams);
  const { action_type, company_id, user_id, from, to, order, page } = filter;

  const query = useQuery(eventsQuery({ action_type, company_id, user_id, from, to, order, page }));
  const events = query.data?.results ?? [];
  const meta = query.data?.meta ?? EMPTY_META;
  const errorMessage = query.isError
    ? query.error instanceof Error
      ? query.error.message
      : "Failed to load events"
    : "";

  const handleFilterChange = useCallback(
    (patch: Partial<EventsFilter>) => {
      set({ ...patch, page: 1, event: undefined });
    },
    [set]
  );

  const handleReset = useCallback(() => {
    set(Object.fromEntries(FILTER_KEYS.map((key) => [key, undefined])));
  }, [set]);

  const handlePageChange = useCallback(
    (page: number) => {
      set({ page, event: undefined });
    },
    [set]
  );

  const rawSelected = searchParams.get("event");
  const selectedEventId = rawSelected ? Number(rawSelected) : null;
  const selectedEvent =
    selectedEventId !== null && Number.isFinite(selectedEventId)
      ? (events.find((event) => event.id === selectedEventId) ?? null)
      : null;

  const handleSelect = useCallback(
    (eventId: number) => {
      set({ event: eventId });
    },
    [set]
  );

  const handleSheetOpenChange = useCallback(
    (open: boolean) => {
      if (!open) set({ event: undefined });
    },
    [set]
  );

  return (
    <div className="space-y-4">
      <EventFilters filter={filter} onChange={handleFilterChange} onReset={handleReset} />
      {errorMessage && <div className="text-sm text-destructive">{errorMessage}</div>}
      {query.isPending ? (
        <div className="text-sm text-muted-foreground">Loading events…</div>
      ) : (
        <EventsTable events={events} selectedEventId={selectedEventId} onSelect={handleSelect} />
      )}
      <Pager
        page={meta.current_page}
        totalPages={meta.total_pages}
        totalCount={meta.total_count}
        onPageChange={handlePageChange}
      />
      <EventDetailSheet
        event={selectedEvent}
        open={selectedEventId !== null && selectedEvent !== null}
        onOpenChange={handleSheetOpenChange}
      />
    </div>
  );
}
