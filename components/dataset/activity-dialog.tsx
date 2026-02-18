"use client";

import { Clock, Minus, Plus, Undo2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ChangeEntry, FieldChange } from "@/lib/blob/change-log";
import { computeSegments, type DiffSegment } from "@/lib/blob/dataset-diff";
import { useDataset } from "@/lib/blob/use-dataset";

// ── Helpers ──────────────────────────────────────────────

function formatRelativeTime(timestamp: number): string {
  const seconds = Math.round((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

function segmentKey(seg: DiffSegment, index: number) {
  return `${seg.type}-${index}-${seg.text.slice(0, 16)}`;
}

function InlineSegments({ segments, mode }: { segments: DiffSegment[]; mode: "removed" | "added" }) {
  const highlight =
    mode === "removed" ? "rounded-sm bg-red-200 dark:bg-red-800" : "rounded-sm bg-green-200 dark:bg-green-800";

  return (
    <>
      {segments.map((seg, i) => {
        if (seg.type === "equal") return <span key={segmentKey(seg, i)}>{seg.text}</span>;
        if (seg.type !== mode) return null;
        return (
          <span key={segmentKey(seg, i)} className={highlight}>
            {seg.text}
          </span>
        );
      })}
    </>
  );
}

// ── Activity entry ───────────────────────────────────────

function ActivityEntry({ entry }: { entry: ChangeEntry }) {
  return (
    <div className="relative flex gap-3 pb-6 last:pb-0">
      <div className="flex flex-col items-center">
        <div
          className={`flex size-6 shrink-0 items-center justify-center rounded-full ${
            entry.isRevert ? "bg-blue-100 dark:bg-blue-900" : "bg-border"
          }`}
        >
          {entry.isRevert ? (
            <Undo2 className="size-3 text-blue-600 dark:text-blue-400" />
          ) : (
            <Clock className="text-muted-foreground size-3" />
          )}
        </div>
        <div className="bg-border w-px flex-1" />
      </div>

      <div className="-mt-0.5 min-w-0 flex-1">
        <p className="text-sm font-medium leading-tight">{entry.description}</p>
        <p className="text-muted-foreground text-xs">{formatRelativeTime(entry.timestamp)}</p>
        {entry.details.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {entry.details.map((d: FieldChange) => {
              const segments = computeSegments(d.from, d.to);
              return (
                <div key={d.field} className="overflow-hidden rounded-md border text-xs">
                  <div className="bg-muted/50 border-b px-2 py-1">
                    <span className="text-muted-foreground font-medium">{d.field}</span>
                  </div>
                  <div className="font-mono">
                    <div className="flex gap-2 border-b bg-red-50/50 px-2 py-1 dark:bg-red-950/20">
                      <Minus className="mt-0.5 size-3 shrink-0 text-red-500" />
                      <span className="min-w-0 break-all text-red-800 dark:text-red-300">
                        <InlineSegments segments={segments} mode="removed" />
                      </span>
                    </div>
                    <div className="flex gap-2 bg-green-50/50 px-2 py-1 dark:bg-green-950/20">
                      <Plus className="mt-0.5 size-3 shrink-0 text-green-500" />
                      <span className="min-w-0 break-all text-green-800 dark:text-green-300">
                        <InlineSegments segments={segments} mode="added" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Dialog ───────────────────────────────────────────────

export function ActivityDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { changeLog } = useDataset();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 px-6 pt-6 pb-4">
          <DialogTitle className="text-lg">
            Activity
            <span className="text-muted-foreground ml-2 text-sm font-normal">
              {changeLog.length} {changeLog.length === 1 ? "action" : "actions"}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
          {changeLog.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">No activity yet.</p>
          ) : (
            <div>
              {[...changeLog].reverse().map((entry) => (
                <ActivityEntry key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
