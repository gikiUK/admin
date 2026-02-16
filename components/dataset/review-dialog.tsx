"use client";

import {
  Clock,
  ExternalLink,
  GitCompare,
  Loader2,
  Minus,
  Plus,
  RotateCcw,
  Send,
  SquarePen,
  Trash2,
  Undo2
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { ChangeEntry, FieldChange } from "@/lib/blob/change-log";
import {
  computeDatasetDiff,
  computeSegments,
  type DiffEntry,
  type DiffKind,
  type DiffSegment,
  type FieldDiff
} from "@/lib/blob/dataset-diff";
import type { RevertFieldTarget } from "@/lib/blob/dataset-reducer";
import { useDataset } from "@/lib/blob/use-dataset";

type Tab = "review" | "activity";

// ── Shared ──────────────────────────────────────────────

const kindConfig: Record<DiffKind, { label: string; icon: typeof Plus; color: string }> = {
  added: { label: "Added", icon: Plus, color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  modified: {
    label: "Modified",
    icon: SquarePen,
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
  },
  disabled: {
    label: "Disabled",
    icon: Trash2,
    color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
  },
  restored: {
    label: "Restored",
    icon: RotateCcw,
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
  }
};

const entityLabels: Record<DiffEntry["entity"], string> = {
  fact: "Facts",
  question: "Questions",
  rule: "Rules",
  constant: "Constants"
};

// ── Inline word diff ────────────────────────────────────

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

// ── Review tab ──────────────────────────────────────────

function buildRevertTarget(entry: DiffEntry, fieldName: string): RevertFieldTarget | null {
  if (entry.entity === "fact") {
    return { entity: "fact", key: entry.key, field: fieldName };
  }
  if (entry.entity === "question") {
    const index = Number.parseInt(entry.key.replace("q-", ""), 10);
    return { entity: "question", index, field: fieldName };
  }
  if (entry.entity === "rule") {
    const index = Number.parseInt(entry.key.replace("r-", ""), 10);
    return { entity: "rule", index, field: fieldName };
  }
  return null;
}

function FieldBlock({
  field,
  entry,
  onRevert
}: {
  field: FieldDiff;
  entry: DiffEntry;
  onRevert: (target: RevertFieldTarget) => void;
}) {
  const target = buildRevertTarget(entry, field.field);

  return (
    <div className="overflow-hidden rounded-md border">
      <div className="bg-muted/50 flex items-center justify-between border-b px-3 py-1.5">
        <span className="text-muted-foreground text-xs font-medium">{field.field}</span>
        {target && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onRevert(target)}
            title={`Revert ${field.field}`}
            className="text-muted-foreground hover:text-foreground -mr-1"
          >
            <Undo2 className="size-3" />
          </Button>
        )}
      </div>
      <div className="font-mono text-xs">
        <div className="flex gap-2 border-b bg-red-50/50 px-3 py-1.5 dark:bg-red-950/20">
          <Minus className="mt-0.5 size-3 shrink-0 text-red-500" />
          <span className="min-w-0 break-all text-red-800 dark:text-red-300">
            <InlineSegments segments={field.segments} mode="removed" />
          </span>
        </div>
        <div className="flex gap-2 bg-green-50/50 px-3 py-1.5 dark:bg-green-950/20">
          <Plus className="mt-0.5 size-3 shrink-0 text-green-500" />
          <span className="min-w-0 break-all text-green-800 dark:text-green-300">
            <InlineSegments segments={field.segments} mode="added" />
          </span>
        </div>
      </div>
    </div>
  );
}

function DiffCard({
  entry,
  onNavigate,
  onRevert
}: {
  entry: DiffEntry;
  onNavigate: () => void;
  onRevert: (target: RevertFieldTarget) => void;
}) {
  const config = kindConfig[entry.kind];
  const Icon = config.icon;

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Badge className={`gap-1 ${config.color}`}>
            <Icon className="size-3" />
            {config.label}
          </Badge>
          <span className="font-mono text-sm font-medium">{entry.label}</span>
        </div>
        {entry.href && (
          <Link
            href={entry.href}
            onClick={onNavigate}
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs"
          >
            View <ExternalLink className="size-3" />
          </Link>
        )}
      </div>

      {entry.fields.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2 px-4 py-3">
            {entry.fields.map((f) => (
              <FieldBlock key={f.field} field={f} entry={entry} onRevert={onRevert} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ReviewTab({ onNavigate }: { onNavigate: () => void }) {
  const { blob, live, revertField } = useDataset();

  const diff = live && blob ? computeDatasetDiff(live.data, blob) : null;
  if (!diff || diff.totalChanges === 0) {
    return <p className="text-muted-foreground py-8 text-center text-sm">No changes to review.</p>;
  }

  const grouped = {
    fact: diff.entries.filter((e) => e.entity === "fact"),
    question: diff.entries.filter((e) => e.entity === "question"),
    rule: diff.entries.filter((e) => e.entity === "rule"),
    constant: diff.entries.filter((e) => e.entity === "constant")
  };

  return (
    <div className="space-y-6">
      {(["fact", "question", "rule", "constant"] as const).map((entity) => {
        const entries = grouped[entity];
        if (entries.length === 0) return null;
        return (
          <div key={entity}>
            <h3 className="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-wider">
              {entityLabels[entity]}
              <span className="ml-1.5 font-normal">({entries.length})</span>
            </h3>
            <div className="space-y-3">
              {entries.map((entry) => (
                <DiffCard key={entry.key} entry={entry} onNavigate={onNavigate} onRevert={revertField} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Activity tab ────────────────────────────────────────

function formatRelativeTime(timestamp: number): string {
  const seconds = Math.round((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

function ActivityEntry({ entry }: { entry: ChangeEntry }) {
  return (
    <div className="relative flex gap-3 pb-6 last:pb-0">
      {/* Timeline line */}
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

      {/* Content */}
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

function ActivityTab() {
  const { changeLog } = useDataset();

  if (changeLog.length === 0) {
    return <p className="text-muted-foreground py-8 text-center text-sm">No activity yet.</p>;
  }

  return (
    <div>
      <p className="text-muted-foreground mb-4 text-xs">{changeLog.length} actions</p>
      <div>
        {[...changeLog].reverse().map((entry) => (
          <ActivityEntry key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}

// ── Main dialog ─────────────────────────────────────────

export function ReviewDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { saving, publish, blob, live } = useDataset();
  const [tab, setTab] = useState<Tab>("review");

  const diff = live && blob ? computeDatasetDiff(live.data, blob) : null;
  const changeCount = diff?.totalChanges ?? 0;

  async function handlePublish() {
    await publish();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 space-y-3 px-6 pt-6 pb-4">
          <DialogTitle className="text-lg">
            Review changes
            <span className="text-muted-foreground ml-2 text-sm font-normal">
              {changeCount} {changeCount === 1 ? "change" : "changes"}
            </span>
          </DialogTitle>

          {/* Tab switcher */}
          <div className="bg-muted inline-flex rounded-lg p-1">
            <button
              type="button"
              onClick={() => setTab("review")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                tab === "review"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <GitCompare className="size-3" />
              Review
            </button>
            <button
              type="button"
              onClick={() => setTab("activity")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                tab === "activity"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Clock className="size-3" />
              Activity
            </button>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-4">
          {tab === "review" ? <ReviewTab onNavigate={() => onOpenChange(false)} /> : <ActivityTab />}
        </div>

        <DialogFooter className="shrink-0 border-t px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Keep editing
          </Button>
          <Button onClick={handlePublish} disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            Publish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
