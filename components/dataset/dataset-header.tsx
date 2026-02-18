"use client";

import { formatDistanceToNow } from "date-fns";
import { CloudCheck, Eye, FilePenLine, Globe, History, Loader2, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { SaveStatus } from "@/lib/blob/dataset-reducer";
import { useDataset } from "@/lib/blob/use-dataset";
import { useHistorySidebar } from "@/lib/history-sidebar-context";
import { ReviewDialog } from "./review-dialog";

function SavedTimeAgo({ lastSavedAt, saveStatus }: { lastSavedAt: number | null; saveStatus: SaveStatus }) {
  const [visible, setVisible] = useState(false);
  const [, setTick] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Show "Saved successfully" for 3s then fade out
  useEffect(() => {
    if (saveStatus === "saved" && lastSavedAt) {
      setVisible(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setVisible(false), 3000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [saveStatus, lastSavedAt]);

  // Re-render periodically to keep relative time in tooltip fresh
  useEffect(() => {
    if (!lastSavedAt) return;
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, [lastSavedAt]);

  if (saveStatus === "error") {
    return (
      <span className="flex items-center gap-1.5 text-sm text-destructive">
        <X className="size-3" />
        Save failed
      </span>
    );
  }

  const isSyncing = saveStatus === "saving";

  if (!isSyncing && !lastSavedAt) return null;

  return (
    <span className="flex items-center gap-1.5 text-sm">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {isSyncing ? (
              <Loader2 className="size-3.5 text-muted-foreground animate-spin" />
            ) : (
              <CloudCheck className="size-3.5 text-green-600 dark:text-green-400 cursor-default" />
            )}
          </TooltipTrigger>
          {lastSavedAt && (
            <TooltipContent>Draft changes saved {formatDistanceToNow(lastSavedAt, { addSuffix: true })}</TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      <span
        className={`transition-opacity duration-500 ${isSyncing ? "opacity-100 text-muted-foreground" : visible ? "opacity-100 text-green-600 dark:text-green-400" : "opacity-0 text-green-600 dark:text-green-400"}`}
        aria-live="polite"
      >
        {isSyncing ? "Syncing..." : "Synced"}
      </span>
    </span>
  );
}

export function DatasetHeader() {
  const { isEditing, saving, deleteDraft, loading, history } = useDataset();
  const { toggleOpen: toggleHistory } = useHistorySidebar();
  const [reviewOpen, setReviewOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const hasHistory = history.entries.length > 0;

  if (loading) return null;

  return (
    <div className="flex items-center gap-2">
      {/* History button — always visible when there's history, independent of draft/live */}
      {hasHistory && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="flex items-center justify-center size-8 rounded-full border border-border bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                onClick={toggleHistory}
              >
                <History className="size-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>History</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Draft/Live pill */}
      {isEditing ? (
        <TooltipProvider>
          <div className="flex items-center rounded-full bg-muted/60 border border-border h-8 overflow-hidden">
            {/* Mode indicator */}
            <div className="flex items-center gap-1.5 pl-3 pr-2 text-xs font-medium text-amber-600 dark:text-amber-400">
              <FilePenLine className="size-3" />
              Draft
            </div>

            <div className="w-px h-4 bg-border" />

            {/* Review */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="flex items-center justify-center px-2.5 h-full text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                  onClick={() => setReviewOpen(true)}
                  disabled={saving}
                >
                  <Eye className="size-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Review changes</TooltipContent>
            </Tooltip>

            <div className="w-px h-4 bg-border" />

            {/* Discard */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="flex items-center justify-center px-2.5 pr-3 h-full text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                  onClick={() => setDiscardOpen(true)}
                  disabled={saving}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Discard draft</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      ) : (
        <div className="flex items-center rounded-full bg-muted/60 border border-border h-8 overflow-hidden">
          <div className="flex items-center gap-1.5 px-3 text-xs font-medium text-green-600 dark:text-green-400">
            <Globe className="size-3" />
            Live
          </div>
        </div>
      )}

      {/* Dialogs */}
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
    </div>
  );
}

export { SavedTimeAgo };
