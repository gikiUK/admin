"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import type { WorkshopInvitee } from "@/lib/workshops/api";

type Props = {
  invitee: WorkshopInvitee;
  onRemove: (uuid: string) => Promise<void>;
};

export function InviteeRow({ invitee, onRemove }: Props) {
  const [removing, setRemoving] = useState(false);

  async function handleRemove() {
    setRemoving(true);
    try {
      await onRemove(invitee.uuid);
    } finally {
      setRemoving(false);
    }
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{invitee.email}</TableCell>
      <TableCell className="font-mono text-xs">{invitee.invite_code}</TableCell>
      <TableCell>
        <div className="flex gap-1">
          {invitee.company_created && <Badge variant="default">Signed up</Badge>}
          {invitee.welcome_email_sent_at && <Badge variant="secondary">Welcome sent</Badge>}
          {invitee.reminder_email_sent_at && <Badge variant="secondary">Reminder sent</Badge>}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground hover:text-destructive"
          onClick={handleRemove}
          disabled={removing}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
