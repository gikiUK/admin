"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteUser, type ManagedUser } from "@/lib/manage/api";

type UserDangerZoneProps = {
  user: ManagedUser;
};

export function UserDangerZone({ user }: UserDangerZoneProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [emailConfirmation, setEmailConfirmation] = useState("");

  const canDelete = emailConfirmation.trim().toLowerCase() === user.email.toLowerCase();

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteUser(user.id);
      toast.success("User deleted");
      router.push("/manage/users");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete user");
      setDeleting(false);
    }
  }

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle className="text-destructive">Danger zone</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">Permanently deletes the user. This is not reversible.</div>
          <AlertDialog onOpenChange={() => setEmailConfirmation("")}>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                disabled={deleting}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 />
                Delete user
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {user.name || user.email}?</AlertDialogTitle>
                <AlertDialogDescription>
                  Hard-deletes the user. All memberships and data are removed. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-2">
                <Label htmlFor={`confirm-delete-${user.id}`}>
                  Type <strong>{user.email}</strong> to confirm
                </Label>
                <Input
                  id={`confirm-delete-${user.id}`}
                  value={emailConfirmation}
                  onChange={(e) => setEmailConfirmation(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction variant="destructive" disabled={!canDelete} onClick={handleDelete}>
                  Delete user
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
