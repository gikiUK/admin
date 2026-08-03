"use client";

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
import { triggerSendgridSync } from "@/lib/sendgrid/api";

export function SendgridSyncButton() {
  const [open, setOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  async function handleSync() {
    setSyncing(true);
    try {
      await triggerSendgridSync();
      toast.success("Sync started.", { description: "Contacts will update in the background." });
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start sync.");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button>Sync all contacts</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sync every contact to SendGrid?</AlertDialogTitle>
          <AlertDialogDescription>
            This enqueues one background job per user, so it isn't free. Day-to-day syncing already happens
            automatically — only run this to backfill after a launch or bulk data change.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={syncing}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              // Keep the dialog open until the request settles, so errors stay visible in context.
              e.preventDefault();
              handleSync();
            }}
            disabled={syncing}
          >
            {syncing ? "Starting…" : "Start sync"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
