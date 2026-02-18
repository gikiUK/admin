"use client";

import { Clock, ExternalLink, Flag, Minus, PanelRightClose, Plus, Redo2, Trash2, Undo2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { ChangeEntry, FieldChange } from "@/lib/blob/change-log";
import { computeSegments, type DiffSegment } from "@/lib/blob/dataset-diff";
import type { MutationAction } from "@/lib/blob/dataset-mutations";
import { useDataset } from "@/lib/blob/use-dataset";
import { useHistorySidebar } from "@/lib/history-sidebar-context";

// ── Helpers ──────────────────────────────────────────────

function formatRelativeTime(timestamp: number): string {
  const seconds = Math.round((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

function actionHref(action: MutationAction | null): string | null {
  if (!action) return null;
  switch (action.type) {
    case "SET_FACT":
    case "ADD_FACT":
    case "DISCARD_FACT":
    case "RESTORE_FACT":
      return `/data/facts/${action.id}`;
    case "SET_QUESTION":
    case "DISCARD_QUESTION":
    case "RESTORE_QUESTION":
      return `/data/questions/${action.index}`;
    case "ADD_QUESTION":
      return "/data/questions";
    case "SET_RULE":
    case "ADD_RULE":
    case "DISCARD_RULE":
    case "RESTORE_RULE":
      return "/data/rules";
    case "SET_CONSTANT_VALUE":
    case "ADD_CONSTANT_VALUE":
    case "TOGGLE_CONSTANT_VALUE":
    case "DELETE_CONSTANT_VALUE":
      return "/data/constants";
    default:
      return null;
  }
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
      className={`relative flex w-full cursor-pointer gap-3 rounded-md border px-2 py-2 text-left transition-colors ${
        isUndone ? "border-dashed border-muted-foreground/40 opacity-60 hover:opacity-80" : "border-transparent"
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
          <p className="min-w-0 text-sm font-medium leading-tight">{entry.description}</p>
          {isCurrent && (
            <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
              HEAD
            </span>
          )}
          {(() => {
            const href = actionHref(entry.action);
            if (!href) return null;
            return (
              <Link
                href={href}
                className="ml-auto shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="size-3" />
              </Link>
            );
          })()}
        </div>
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
    </button>
  );
}

// ── Lifecycle marker ─────────────────────────────────────

function LifecycleMarker({ entry }: { entry: ChangeEntry }) {
  return (
    <div className="flex items-center gap-2 px-2 py-1.5">
      <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted">
        <Flag className="size-3 text-muted-foreground" />
      </div>
      <span className="text-muted-foreground text-xs font-medium">{entry.description}</span>
      <span className="text-muted-foreground/60 ml-auto text-[10px]">{formatRelativeTime(entry.timestamp)}</span>
    </div>
  );
}

// ── Sidebar ─────────────────────────────────────────────

export function HistorySidebar() {
  const { open, setOpen } = useHistorySidebar();
  const { history, travelTo, undo, redo, canUndo, canRedo, clearHistory } = useDataset();
  const { entries, cursor } = history;

  return (
    <div data-state={open ? "expanded" : "collapsed"}>
      {/* Gap — takes up space in the flex row so SidebarInset shrinks */}
      <div
        className="relative w-0 bg-transparent transition-[width] duration-200 ease-linear data-[state=expanded]:w-[24rem]"
        data-state={open ? "expanded" : "collapsed"}
      />

      {/* Fixed panel */}
      <aside
        className="bg-sidebar text-sidebar-foreground fixed inset-y-0 right-0 z-10 hidden h-svh w-[24rem] flex-col border-l transition-[right] duration-200 ease-linear md:flex data-[state=collapsed]:right-[calc(24rem*-1)]"
        data-state={open ? "expanded" : "collapsed"}
      >
        {/* Header */}
        <div className="flex h-12 items-center gap-2 border-b px-4">
          <span className="text-sm font-semibold">History</span>
          <span className="text-muted-foreground text-xs">
            {entries.length} {entries.length === 1 ? "change" : "changes"}
          </span>
          <div className="ml-auto flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="size-7" onClick={undo} disabled={!canUndo}>
              <Undo2 className="size-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="size-7" onClick={redo} disabled={!canRedo}>
              <Redo2 className="size-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="size-7" onClick={() => setOpen(false)}>
              <PanelRightClose className="size-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {entries.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">No history yet.</p>
          ) : (
            <div className="space-y-1">
              {[...entries].reverse().map((entry, reversedIdx) => {
                const realIndex = entries.length - 1 - reversedIdx;
                if (entry.isLifecycle) {
                  return <LifecycleMarker key={entry.id} entry={entry} />;
                }
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

        {/* Footer */}
        {entries.length > 0 && (
          <div className="border-t px-4 py-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => {
                clearHistory();
                setOpen(false);
              }}
            >
              <Trash2 className="size-3.5" />
              Clear history
            </Button>
          </div>
        )}
      </aside>
    </div>
  );
}
