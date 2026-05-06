"use client";

import { useRouter } from "next/navigation";
import { AccessStatusBadge } from "@/components/manage/access-status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ManagedCompany } from "@/lib/manage/api";

type OrgsTableProps = {
  companies: ManagedCompany[];
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

export function OrgsTable({ companies }: OrgsTableProps) {
  const router = useRouter();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Organisation</TableHead>
            <TableHead className="w-[120px]">Access</TableHead>
            <TableHead className="w-[140px]">Trial ends</TableHead>
            <TableHead className="w-[160px]">Gifted premium until</TableHead>
            <TableHead className="w-[90px] text-right">Members</TableHead>
            <TableHead className="w-[90px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No organisations found.
              </TableCell>
            </TableRow>
          ) : (
            companies.map((company) => (
              <TableRow
                key={company.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/manage/organisations/${encodeURIComponent(company.slug)}`)}
              >
                <TableCell>
                  <div className="font-medium">{company.name}</div>
                  <div className="text-xs text-muted-foreground">{company.slug}</div>
                </TableCell>
                <TableCell>
                  <AccessStatusBadge status={company.access_status} />
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{formatDate(company.trial_ends_at)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDate(company.gifted_premium_until)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">{company.members_count}</TableCell>
                <TableCell className="text-right font-mono text-sm">{company.tracked_actions_count}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
