"use client";

import { ExternalLink, Loader2, Minus, Plus, RotateCcw, Send, SquarePen, Trash2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  computeDatasetDiff,
  type DiffEntry,
  type DiffKind,
  type DiffSegment,
  type FieldDiff
} from "@/lib/blob/dataset-diff";
import { useDataset } from "@/lib/blob/use-dataset";

const kindConfig: Record<DiffKind, { label: string; icon: typeof Plus; color: string }> = {
  added: { label: "Added", icon: Plus, color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  modified: {
    label: "Modified",
    icon: SquarePen,
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
  },
  discarded: {
    label: "Discarded",
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
  rule: "Rules"
};

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

function FieldBlock({ field }: { field: FieldDiff }) {
  return (
    <div className="overflow-hidden rounded-md border">
      <div className="bg-muted/50 border-b px-3 py-1.5">
        <span className="text-muted-foreground text-xs font-medium">{field.field}</span>
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

function DiffCard({ entry, onNavigate }: { entry: DiffEntry; onNavigate?: () => void }) {
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
              <FieldBlock key={f.field} field={f} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function DiffView({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { blob, original, saving, save } = useDataset();

  const diff = original && blob ? computeDatasetDiff(original, blob) : null;

  if (!diff) return null;

  const grouped = {
    fact: diff.entries.filter((e) => e.entity === "fact"),
    question: diff.entries.filter((e) => e.entity === "question"),
    rule: diff.entries.filter((e) => e.entity === "rule")
  };

  function handlePublish() {
    save();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] gap-0 overflow-hidden sm:max-w-2xl">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-lg">
            Review changes
            <span className="text-muted-foreground ml-2 text-sm font-normal">
              {diff.totalChanges} {diff.totalChanges === 1 ? "change" : "changes"}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {diff.totalChanges === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">No changes to review.</p>
          ) : (
            <div className="space-y-6">
              {(["fact", "question", "rule"] as const).map((entity) => {
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
                        <DiffCard key={entry.key} entry={entry} onNavigate={() => onOpenChange(false)} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {diff.totalChanges > 0 && (
          <DialogFooter className="border-t px-6 py-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Keep editing
            </Button>
            <Button onClick={handlePublish} disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              Publish
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
