"use client";

import { Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchOrganization, type OrgMember } from "@/lib/analytics/api";
import { deleteMembership, MEMBERSHIP_ROLES, type MembershipRole, updateMembershipRole } from "@/lib/manage/api";

type OrgMembersPanelProps = {
  slug: string;
  onMembershipChange?: () => void;
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

export function OrgMembersPanel({ slug, onMembershipChange }: OrgMembersPanelProps) {
  const [members, setMembers] = useState<OrgMember[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pending, setPending] = useState<number | null>(null);

  const reload = useCallback(() => {
    setLoading(true);
    setError("");
    fetchOrganization(slug)
      .then((response) => setMembers(response.organization.members))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load members"))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function handleRoleChange(member: OrgMember, role: MembershipRole) {
    if (role === member.role) return;
    setPending(member.id);
    try {
      await updateMembershipRole(slug, member.id, role);
      toast.success(`${member.name || member.email} is now ${role}`);
      setMembers((current) => (current ? current.map((m) => (m.id === member.id ? { ...m, role } : m)) : current));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change role");
    } finally {
      setPending(null);
    }
  }

  async function handleRemove(member: OrgMember) {
    setPending(member.id);
    try {
      await deleteMembership(slug, member.id);
      toast.success(`${member.name || member.email} removed`);
      setMembers((current) => (current ? current.filter((m) => m.id !== member.id) : current));
      onMembershipChange?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove member");
    } finally {
      setPending(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Members</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <div className="text-sm text-muted-foreground">Loading members…</div>}
        {error && <div className="text-sm text-destructive">{error}</div>}
        {members && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="w-[140px]">Role</TableHead>
                  <TableHead className="w-[120px]">Joined</TableHead>
                  <TableHead className="w-[140px]">Last active</TableHead>
                  <TableHead className="w-[80px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No members.
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.name || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{member.email}</TableCell>
                      <TableCell>
                        <Select
                          value={member.role}
                          onValueChange={(next: MembershipRole) => handleRoleChange(member, next)}
                          disabled={pending === member.id}
                        >
                          <SelectTrigger className="h-8 w-[120px] text-xs capitalize">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {MEMBERSHIP_ROLES.map((role) => (
                              <SelectItem key={role} value={role} className="capitalize">
                                {role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDate(member.joined_at)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(member.last_active_at)}
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={pending === member.id}
                              className="text-destructive hover:text-destructive"
                              aria-label={`Remove ${member.name || member.email}`}
                            >
                              <Trash2 />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove {member.name || member.email}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Removes this user from the organisation. They lose access immediately.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction variant="destructive" onClick={() => handleRemove(member)}>
                                Remove member
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
