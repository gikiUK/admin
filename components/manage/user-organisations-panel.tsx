"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteMembership, type ManagedUser, type ManagedUserCompany } from "@/lib/manage/api";

type UserOrganisationsPanelProps = {
  user: ManagedUser;
  onMembershipChange: () => void;
};

export function UserOrganisationsPanel({ user, onMembershipChange }: UserOrganisationsPanelProps) {
  const [pending, setPending] = useState<number | null>(null);

  async function handleRemove(company: ManagedUserCompany) {
    setPending(company.membership_id);
    try {
      await deleteMembership(company.slug, company.membership_id);
      toast.success(`Removed from ${company.name}`);
      onMembershipChange();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove from organisation");
    } finally {
      setPending(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organisations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organisation</TableHead>
                <TableHead className="w-[140px]">Role</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {user.companies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    Not a member of any organisation.
                  </TableCell>
                </TableRow>
              ) : (
                user.companies.map((company) => (
                  <TableRow key={company.membership_id}>
                    <TableCell>
                      <Link
                        href={`/manage/organisations/${encodeURIComponent(company.slug)}`}
                        className="font-medium hover:underline"
                      >
                        {company.name}
                      </Link>
                      <div className="text-xs text-muted-foreground">{company.slug}</div>
                    </TableCell>
                    <TableCell className="text-sm capitalize">{company.role}</TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={pending === company.membership_id}
                            className="text-destructive hover:text-destructive"
                            aria-label={`Remove from ${company.name}`}
                          >
                            <Trash2 />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove from {company.name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              {user.name || user.email} loses access to this organisation immediately.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction variant="destructive" onClick={() => handleRemove(company)}>
                              Remove
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
      </CardContent>
    </Card>
  );
}
