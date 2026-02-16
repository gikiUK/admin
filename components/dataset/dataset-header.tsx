"use client";

import { Check, Eye, FilePenLine, Loader2, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import type { SaveStatus } from "@/lib/blob/dataset-reducer";
import { useDataset } from "@/lib/blob/use-dataset";
import { ReviewDialog } from "./review-dialog";

function SaveStatusIndicator({ status }: { status: SaveStatus }) {
  if (status === "saving") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="size-3 animate-spin" />
        Saving...
      </span>
    );
  }
  if (status === "saved") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
        <Check className="size-3" />
        Saved
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-destructive">
        <X className="size-3" />
        Save failed
      </span>
    );
  }
  return null;
}

export function DatasetHeader() {
  const { isEditing, saving, saveStatus, deleteDraft, loading } = useDataset();
  const [reviewOpen, setReviewOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (loading) return null;

  // ── Editing mode: show draft controls ───────────────
  if (isEditing) {
    return (
      <>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1 border-amber-500/40 text-amber-600 dark:text-amber-400">
            <FilePenLine className="size-3" />
            Draft
          </Badge>

          <SaveStatusIndicator status={saveStatus} />

          <Button size="sm" onClick={() => setReviewOpen(true)} disabled={saving}>
            <Eye className="size-3" />
            Review
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setDiscardOpen(true)}
            disabled={saving}
          >
            <Trash2 className="size-3" />
            Discard draft
          </Button>
        </div>

        <ReviewDialog open={reviewOpen} onOpenChange={setReviewOpen} />

        <Dialog open={discardOpen} onOpenChange={setDiscardOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Discard draft</DialogTitle>
              <DialogDescription>
                This will permanently delete the current draft. All unsaved changes will be lost. The live dataset will
                remain unchanged.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                variant="destructive"
                disabled={deleting}
                onClick={async () => {
                  setDeleting(true);
                  try {
                    await deleteDraft();
                    setDiscardOpen(false);
                  } finally {
                    setDeleting(false);
                  }
                }}
              >
                {deleting && <Loader2 className="size-4 animate-spin" />}
                Discard
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // ── Live mode: just show badge ────────────
  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="gap-1">
        Live
      </Badge>
    </div>
  );
}
