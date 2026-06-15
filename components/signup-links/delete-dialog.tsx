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
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { deleteSignupLink } from "@/lib/signup-links/api";
import type { SignupLink } from "@/lib/signup-links/types";

type Props = {
  link: SignupLink | null;
  onClose: () => void;
  onDeleted: () => void;
};

export function SignupLinkDeleteDialog({ link, onClose, onDeleted }: Props) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!link) return;
    setDeleting(true);
    try {
      await deleteSignupLink(link.uuid);
      toast.success(`Deleted "${link.title}".`);
      onDeleted();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete signup link.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AlertDialog open={link !== null} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete signup link?</AlertDialogTitle>
          <AlertDialogDescription>
            {link
              ? `"${link.title}" (code ${link.code}) will be permanently deleted. Companies that already signed up via this link are unaffected.`
              : ""}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
