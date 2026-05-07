"use client";

import { useRouter } from "next/navigation";
import { UserStatusBadge } from "@/components/manage/user-status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AnalyticsUser } from "@/lib/analytics/api";

type UsersTableProps = {
  users: AnalyticsUser[];
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

function summarizeCompanies(user: AnalyticsUser): string {
  if (user.companies.length === 0) return "—";
  const [first, ...rest] = user.companies;
  if (rest.length === 0) return first.name;
  return `${first.name} +${rest.length}`;
}

export function UsersTable({ users }: UsersTableProps) {
  const router = useRouter();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead className="w-[140px]">Status</TableHead>
            <TableHead>Companies</TableHead>
            <TableHead className="w-[140px]">Last active</TableHead>
            <TableHead className="w-[140px]">Signed up</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No users found.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow
                key={user.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/manage/users/${user.id}`)}
              >
                <TableCell>
                  <div className="font-medium">{user.name || "—"}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </TableCell>
                <TableCell>
                  <UserStatusBadge status={user.status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{summarizeCompanies(user)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{formatDate(user.last_active_at)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{formatDate(user.signed_up_at)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
