"use client";

import { EventDetails } from "@/components/analytics/event-details";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AnalyticsEvent } from "@/lib/analytics/api";

type EventsTableProps = {
  events: AnalyticsEvent[];
};

function formatTimestamp(value: string): string {
  return new Date(value).toLocaleString();
}

export function EventsTable({ events }: EventsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">When</TableHead>
            <TableHead>Event</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No events found.
              </TableCell>
            </TableRow>
          ) : (
            events.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="text-xs text-muted-foreground">{formatTimestamp(event.created_at)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono text-xs">
                    {event.action_type}
                  </Badge>
                </TableCell>
                <TableCell>{event.user?.name ?? "—"}</TableCell>
                <TableCell>{event.company?.name ?? "—"}</TableCell>
                <TableCell>
                  <EventDetails details={event.details} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
