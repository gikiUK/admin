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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { clearEmailBounce, confirmUser, type ManagedUser, sendPasswordReset } from "@/lib/manage/api";

type UserAccountActionsPanelProps = {
  user: ManagedUser;
  onUpdate: (user: ManagedUser) => void;
};

export function UserAccountActionsPanel({ user, onUpdate }: UserAccountActionsPanelProps) {
  const [pending, setPending] = useState<string | null>(null);

  async function run<T>(action: string, fn: () => Promise<T>, successMessage: string): Promise<T | null> {
    setPending(action);
    try {
      const result = await fn();
      toast.success(successMessage);
      return result;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Failed: ${action}`);
      return null;
    } finally {
      setPending(null);
    }
  }

  async function handleSendPasswordReset() {
    await run("send-password-reset", () => sendPasswordReset(user.id), "Password reset email sent");
  }

  async function handleConfirm() {
    const result = await run("confirm", () => confirmUser(user.id), "Email confirmed");
    if (result) onUpdate(result.user);
  }

  async function handleClearBounce() {
    const result = await run("clear-bounce", () => clearEmailBounce(user.id), "Email bounce cleared");
    if (result) onUpdate(result.user);
  }

  const busy = pending !== null;
  const isUnconfirmed = !user.confirmed_at;
  const hasBounce = !!user.email_bounced_at;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm">
              <div className="font-medium">Send password reset</div>
              <div className="text-xs text-muted-foreground">Emails the user a link to set a new password.</div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="outline" disabled={busy}>
                  {pending === "send-password-reset" ? "Sending…" : "Send reset"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Send password reset email?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Sends a password reset link to <strong>{user.email}</strong>.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSendPasswordReset}>Send</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {isUnconfirmed && (
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm">
                <div className="font-medium">Confirm email</div>
                <div className="text-xs text-muted-foreground">
                  Marks <strong>{user.email}</strong> as confirmed without a confirmation email.
                </div>
              </div>
              <Button size="sm" variant="outline" disabled={busy} onClick={handleConfirm}>
                {pending === "confirm" ? "Confirming…" : "Confirm"}
              </Button>
            </div>
          )}

          {hasBounce && (
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm">
                <div className="font-medium">Clear email bounce</div>
                <div className="text-xs text-muted-foreground">
                  Removes the bounce flag so emails will be sent again.
                </div>
              </div>
              <Button size="sm" variant="outline" disabled={busy} onClick={handleClearBounce}>
                {pending === "clear-bounce" ? "Clearing…" : "Clear bounce"}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
