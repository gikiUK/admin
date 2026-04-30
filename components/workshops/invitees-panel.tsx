"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { batchAddInvitees, removeInvitee, type WorkshopInvitee } from "@/lib/workshops/api";
import { InviteeRow } from "./invitee-row";

type Props = {
  workshopUuid: string;
  invitees: WorkshopInvitee[];
  onChange: () => void;
};

export function InviteesPanel({ workshopUuid, invitees, onChange }: Props) {
  const [emails, setEmails] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  async function handleAdd() {
    if (!emails.trim()) return;
    setAdding(true);
    setError("");
    try {
      await batchAddInvitees(workshopUuid, emails);
      setEmails("");
      onChange();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add invitees");
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(inviteeUuid: string) {
    try {
      await removeInvitee(workshopUuid, inviteeUuid);
      onChange();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to remove invitee");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">Invitees</h2>
        <Badge variant="secondary">{invitees.length}</Badge>
      </div>
      <div className="space-y-2">
        <Textarea
          rows={4}
          value={emails}
          onChange={(e) => setEmails(e.target.value)}
          placeholder={"Paste email addresses (one per line or space-separated)"}
        />
        {error && <p className="text-destructive text-sm">{error}</p>}
        <Button onClick={handleAdd} disabled={adding || !emails.trim()}>
          {adding ? "Adding…" : "Add Invitees"}
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Invite Code</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitees.length === 0 ? (
              <TableRow>
                <td colSpan={4} className="py-4 text-center text-sm text-muted-foreground">
                  No invitees yet.
                </td>
              </TableRow>
            ) : (
              invitees.map((inv) => <InviteeRow key={inv.uuid} invitee={inv} onRemove={handleRemove} />)
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
