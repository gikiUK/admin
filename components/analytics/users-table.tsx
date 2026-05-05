"use client";

import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AnalyticsUser, UserStatus } from "@/lib/analytics/api";
import { cn } from "@/lib/utils";

type UsersTableProps = {
  users: AnalyticsUser[];
};

const STATUS_STYLES: Record<UserStatus, string> = {
  active: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  dormant: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  churned: "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400",
  unconfirmed: "border-muted-foreground/30 bg-muted text-muted-foreground",
  bounced: "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400"
};

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

export function UsersTable({ users }: UsersTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
            <TableHead>Companies</TableHead>
            <TableHead>Invited by</TableHead>
            <TableHead className="w-[100px] text-right">Events</TableHead>
            <TableHead className="w-[160px]">Last active</TableHead>
            <TableHead className="w-[140px]">Signed up</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No users found.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="font-medium">{user.name || "(unnamed)"}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("text-xs capitalize", STATUS_STYLES[user.status])}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.companies.length === 0 ? (
                    <span className="text-muted-foreground">—</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {user.companies.map((company) => (
                        <Badge key={company.id} variant="outline" className="text-xs">
                          {company.name}
                          <span className="ml-1 text-muted-foreground">· {company.role}</span>
                        </Badge>
                      ))}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {user.invited_by.length === 0 ? (
                    <span className="text-xs text-muted-foreground">self-signup</span>
                  ) : (
                    <div className="flex flex-col gap-0.5 text-xs">
                      {user.invited_by.map((inviter) => (
                        <span key={`${inviter.id}-${inviter.company_id}`}>
                          {inviter.name}
                          <span className="text-muted-foreground"> · {inviter.company_name}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">{user.event_count.toLocaleString()}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{formatDateTime(user.last_active_at)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{formatDate(user.signed_up_at)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
