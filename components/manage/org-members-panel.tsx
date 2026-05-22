"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AddMemberDialog } from "@/components/manage/add-member-dialog";
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
import type { Paginated } from "@/lib/api/client";
import {
  deleteMembership,
  MEMBERSHIP_ROLES,
  type Membership,
  type MembershipRole,
  updateMembershipRole
} from "@/lib/manage/api";
import { manageKeys, membershipsQuery } from "@/lib/manage/queries";

type OrgMembersPanelProps = {
  slug: string;
  onMembershipChange?: () => void;
};

const MEMBERSHIPS_FILTER = { per: 100 } as const;

export function OrgMembersPanel({ slug, onMembershipChange }: OrgMembersPanelProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState<number | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const query = useQuery(membershipsQuery(slug, MEMBERSHIPS_FILTER));
  const members = query.data?.results ?? null;
  const errorMessage = query.isError
    ? query.error instanceof Error
      ? query.error.message
      : "Failed to load members"
    : "";

  function updateLocal(updater: (current: Membership[]) => Membership[]) {
    queryClient.setQueryData<Paginated<Membership>>(manageKeys.memberships(slug, MEMBERSHIPS_FILTER), (current) => {
      if (!current) return current;
      return { ...current, results: updater(current.results) };
    });
  }

  async function handleRoleChange(member: Membership, role: MembershipRole) {
    if (role === member.role) return;
    setPending(member.id);
    try {
      await updateMembershipRole(slug, member.id, role);
      toast.success(`${member.user.name || member.user.email} is now ${role}`);
      updateLocal((current) => current.map((m) => (m.id === member.id ? { ...m, role } : m)));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change role");
    } finally {
      setPending(null);
    }
  }

  async function handleRemove(member: Membership) {
    setPending(member.id);
    try {
      await deleteMembership(slug, member.id);
      toast.success(`${member.user.name || member.user.email} removed`);
      updateLocal((current) => current.filter((m) => m.id !== member.id));
      onMembershipChange?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove member");
    } finally {
      setPending(null);
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Members</CardTitle>
          <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>
            <Plus />
            Add member
          </Button>
        </CardHeader>
        <CardContent>
          {query.isPending && <div className="text-sm text-muted-foreground">Loading members…</div>}
          {errorMessage && <div className="text-sm text-destructive">{errorMessage}</div>}
          {members && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="w-[140px]">Role</TableHead>
                    <TableHead className="w-[80px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No members.
                      </TableCell>
                    </TableRow>
                  ) : (
                    members.map((member) => (
                      <TableRow
                        key={member.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => router.push(`/manage/users/${member.user.id}`)}
                      >
                        <TableCell className="font-medium">{member.user.name || "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{member.user.email}</TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
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
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={pending === member.id}
                                className="text-destructive hover:text-destructive"
                                aria-label={`Remove ${member.user.name || member.user.email}`}
                              >
                                <Trash2 />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove {member.user.name || member.user.email}?</AlertDialogTitle>
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
      <AddMemberDialog
        slug={slug}
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdded={() => {
          queryClient.invalidateQueries({ queryKey: manageKeys.memberships(slug, MEMBERSHIPS_FILTER) });
          onMembershipChange?.();
        }}
      />
    </>
  );
}
