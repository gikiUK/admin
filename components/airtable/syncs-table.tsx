"use client";

import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AirtableSync } from "@/lib/airtable/api";

type SyncsTableProps = {
  syncs: AirtableSync[];
};

function formatTimestamp(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "completed":
      return "default";
    case "pending":
    case "scheduled":
      return "outline";
    case "running":
      return "secondary";
    case "failed":
      return "destructive";
    default:
      return "outline";
  }
}

export function SyncsTable({ syncs }: SyncsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Started At</TableHead>
            <TableHead>Completed At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {syncs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground">
                No syncs found.
              </TableCell>
            </TableRow>
          ) : (
            syncs.map((sync) => (
              <TableRow key={sync.id}>
                <TableCell>
                  <Badge variant={statusVariant(sync.status)}>{sync.status}</Badge>
                </TableCell>
                <TableCell>{formatTimestamp(sync.started_at)}</TableCell>
                <TableCell>{formatTimestamp(sync.completed_at)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
