"use client";

import { Eye, FilePenLine, Loader2, Trash2 } from "lucide-react";
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
import { useDataset } from "@/lib/blob/use-dataset";
import { ReviewDialog } from "./review-dialog";

export function DatasetHeader() {
  const { isEditing, isDirty, saving, changeLog, createDraft, deleteDraft, loading } = useDataset();
  const [reviewOpen, setReviewOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [creating, setCreating] = useState(false);
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

          {isDirty && (
            <Button size="sm" onClick={() => setReviewOpen(true)} disabled={saving}>
              <Eye className="size-3" />
              {changeLog.length} {changeLog.length === 1 ? "change" : "changes"} · Review
            </Button>
          )}

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

  // ── Live mode: show start editing button ────────────
  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="gap-1">
        Live
      </Badge>
      <Button
        size="sm"
        disabled={creating}
        onClick={async () => {
          setCreating(true);
          try {
            await createDraft();
          } finally {
            setCreating(false);
          }
        }}
      >
        {creating ? <Loader2 className="size-4 animate-spin" /> : <FilePenLine className="size-4" />}
        Start editing
      </Button>
    </div>
  );
}
