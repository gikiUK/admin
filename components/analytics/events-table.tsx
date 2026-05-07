"use client";

import { EventBadge } from "@/components/analytics/event-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { AnalyticsEvent } from "@/lib/analytics/api";
import { formatRelative, getEventDisplay, summarizeEvent } from "@/lib/analytics/event-display";
import { cn } from "@/lib/utils";

type EventsTableProps = {
  events: AnalyticsEvent[];
  selectedEventId?: number | null;
  onSelect?: (eventId: number) => void;
};

export function EventsTable({ events, selectedEventId, onSelect }: EventsTableProps) {
  return (
    <TooltipProvider>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px]">When</TableHead>
              <TableHead className="w-[200px]">Event</TableHead>
              <TableHead>Summary</TableHead>
              <TableHead className="w-[160px]">Org</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No events found.
                </TableCell>
              </TableRow>
            ) : (
              events.map((event) => {
                const display = getEventDisplay(event.action_type);
                const isSelected = selectedEventId === event.id;
                return (
                  <TableRow
                    key={event.id}
                    onClick={onSelect ? () => onSelect(event.id) : undefined}
                    className={cn(onSelect && "cursor-pointer hover:bg-muted/40", isSelected && "bg-muted/60")}
                  >
                    <TableCell className="text-xs text-muted-foreground">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>{formatRelative(event.created_at)}</span>
                        </TooltipTrigger>
                        <TooltipContent>{new Date(event.created_at).toLocaleString()}</TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <EventBadge display={display} />
                    </TableCell>
                    <TableCell className="text-sm">
                      <span className="line-clamp-2">{summarizeEvent(event)}</span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{event.about_company?.name ?? "—"}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}
