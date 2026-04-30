"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Workshop } from "@/lib/workshops/api";

const PAGE_SIZE = 25;

function formatDate(value: string): string {
  return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

type Props = { workshops: Workshop[]; page: number; totalPages: number; onPageChange: (p: number) => void };

export function WorkshopsTable({ workshops, page, totalPages, onPageChange }: Props) {
  const router = useRouter();

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
            {workshops.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No workshops found.
                </TableCell>
              </TableRow>
            ) : (
              workshops.map((w) => (
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
            : `${(page - 1) * PAGE_SIZE + 1}–${(page - 1) * PAGE_SIZE + workshops.length}`}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="px-2">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
