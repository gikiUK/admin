"use client";

import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { WorkshopCompany } from "@/lib/workshops/api";

type Props = { companies: WorkshopCompany[] };

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function CompaniesPanel({ companies }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">Attendees</h2>
        <Badge variant="secondary">{companies.length}</Badge>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>User Email</TableHead>
              <TableHead>Followup Sent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No attendees yet.
                </TableCell>
              </TableRow>
            ) : (
              companies.map((c) => (
                <TableRow key={c.company_slug}>
                  <TableCell className="font-medium">{c.company_name}</TableCell>
                  <TableCell>{c.user_email}</TableCell>
                  <TableCell>{formatDate(c.followup_email_sent_at)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
