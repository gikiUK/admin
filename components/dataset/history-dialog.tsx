"use client";

import { Clock, Minus, Plus, Trash2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

// ── History entry ────────────────────────────────────────

function HistoryEntry({
  entry,
  index,
  isCurrent,
  isUndone,
  onTravel
}: {
  entry: ChangeEntry;
  index: number;
  isCurrent: boolean;
  isUndone: boolean;
  onTravel: (index: number) => void;
}) {
  return (
    <button
      type="button"
      className={`relative flex w-full cursor-pointer gap-3 rounded-md px-2 py-2 text-left transition-colors ${
        isUndone ? "opacity-40 hover:opacity-70" : ""
      } ${isCurrent ? "bg-primary/5 ring-primary/30 ring-1" : "hover:bg-muted/50"}`}
      onClick={() => onTravel(index)}
    >
      {/* Timeline dot */}
      <div className="flex flex-col items-center">
        <div
          className={`flex size-6 shrink-0 items-center justify-center rounded-full ${
            isCurrent
              ? "bg-primary text-primary-foreground"
              : entry.isRevert
                ? "bg-blue-100 dark:bg-blue-900"
                : "bg-border"
          }`}
        >
          {entry.isRevert && !isCurrent ? (
            <Undo2 className="size-3 text-blue-600 dark:text-blue-400" />
          ) : (
            <Clock className={`size-3 ${isCurrent ? "" : "text-muted-foreground"}`} />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="-mt-0.5 min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium leading-tight">{entry.description}</p>
          {isCurrent && (
            <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
              HEAD
            </span>
          )}
        </div>
        <p className="text-muted-foreground text-xs">{formatRelativeTime(entry.timestamp)}</p>
        {entry.details.length > 0 && !isUndone && (
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
    </button>
  );
}

// ── Dialog ───────────────────────────────────────────────

export function HistoryDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { history, travelTo, clearHistory } = useDataset();
  const { entries, cursor } = history;
  const hasUndone = cursor < entries.length - 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 px-6 pt-6 pb-4">
          <DialogTitle className="text-lg">
            History
            <span className="text-muted-foreground ml-2 text-sm font-normal">
              {entries.length} {entries.length === 1 ? "change" : "changes"}
            </span>
          </DialogTitle>
          {entries.length > 0 && (
            <p className="text-muted-foreground text-xs">
              Click any entry to travel to that point. {hasUndone && "New edits will replace future entries."}
            </p>
          )}
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {entries.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">No history yet.</p>
          ) : (
            <div className="space-y-1">
              {[...entries].reverse().map((entry, reversedIdx) => {
                const realIndex = entries.length - 1 - reversedIdx;
                return (
                  <HistoryEntry
                    key={entry.id}
                    entry={entry}
                    index={realIndex}
                    isCurrent={realIndex === cursor}
                    isUndone={realIndex > cursor}
                    onTravel={travelTo}
                  />
                );
              })}
            </div>
          )}
        </div>

        {entries.length > 0 && (
          <DialogFooter className="shrink-0 border-t px-6 py-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => {
                clearHistory();
                onOpenChange(false);
              }}
            >
              <Trash2 className="size-3.5" />
              Clear history
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
