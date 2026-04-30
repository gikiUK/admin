"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Workshop } from "@/lib/workshops/api";

const PAGE_SIZE = 25;

function formatDate(value: string): string {
  return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

type Props = { workshops: Workshop[] };

export function WorkshopsTable({ workshops }: Props) {
  const router = useRouter();
  const [page, setPage] = useState(0);

  const pageCount = Math.max(1, Math.ceil(workshops.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const items = workshops.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Scheduled</TableHead>
              <TableHead>Invite Code</TableHead>
              <TableHead className="text-right">Invitees</TableHead>
              <TableHead className="text-right">Attendees</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No workshops found.
                </TableCell>
              </TableRow>
            ) : (
              items.map((w) => (
                <TableRow
                  key={w.uuid}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/workshops/${w.uuid}`)}
                >
                  <TableCell className="font-medium">{w.title}</TableCell>
                  <TableCell>{formatDate(w.scheduled_at)}</TableCell>
                  <TableCell className="font-mono text-xs">{w.invite_code}</TableCell>
                  <TableCell className="text-right">{w.invitees_count}</TableCell>
                  <TableCell className="text-right">{w.attendees_count}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {workshops.length === 0
            ? "No results"
            : `${current * PAGE_SIZE + 1}–${Math.min((current + 1) * PAGE_SIZE, workshops.length)} of ${workshops.length}`}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => setPage((p) => p - 1)}
            disabled={current === 0}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="px-2">
            {current + 1} / {pageCount}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => setPage((p) => p + 1)}
            disabled={current >= pageCount - 1}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
