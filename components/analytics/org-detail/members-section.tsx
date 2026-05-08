import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { OrgMember } from "@/lib/analytics/api";
import { formatDate, formatDateTime } from "./format";

export function MembersSection({ members }: { members: OrgMember[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Members ({members.length})</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead className="w-[100px]">Role</TableHead>
              <TableHead className="w-[100px] text-right">Events</TableHead>
              <TableHead className="w-[160px]">Last active</TableHead>
              <TableHead className="w-[140px]">Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No members.
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="font-medium">{member.name || "(unnamed)"}</div>
                    <div className="text-xs text-muted-foreground">{member.email}</div>
                  </TableCell>
                  <TableCell className="text-xs capitalize">{member.role}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{member.event_count.toLocaleString()}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDateTime(member.last_active_at)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(member.joined_at)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
