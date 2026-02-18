"use client";

import { ExternalLink, EyeOff, Loader2, Minus, Plus, RotateCcw, Send, SquarePen, Trash2, Undo2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  computeDatasetDiff,
  type DiffEntry,
  type DiffKind,
  type DiffSegment,
  type FieldDiff
} from "@/lib/blob/dataset-diff";
import type { RevertFieldTarget } from "@/lib/blob/dataset-reducer";
import { useDataset } from "@/lib/blob/use-dataset";

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
    icon: EyeOff,
    color: "bg-muted text-muted-foreground"
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
  if (entry.entity === "constant") {
    // key format: "const-{group}-{id}"
    const match = entry.key.match(/^const-(.+)-(\d+)$/);
    if (match) {
      return { entity: "constant", group: match[1], valueId: Number.parseInt(match[2], 10), field: fieldName };
    }
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
  const canRevertWhole =
    (entry.kind === "disabled" || entry.kind === "restored") && buildRevertTarget(entry, "enabled") !== null;

  function handleRevertWhole() {
    const target = buildRevertTarget(entry, "enabled");
    if (target) onRevert(target);
  }

  return (
    <div className={`rounded-lg border bg-card ${entry.kind === "disabled" ? "border-dashed bg-muted/30" : ""}`}>
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Badge className={`gap-1 ${config.color}`}>
            <Icon className="size-3" />
            {config.label}
          </Badge>
          <span className="font-mono text-sm font-medium">{entry.label}</span>
        </div>
        <div className="flex items-center gap-2">
          {canRevertWhole && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRevertWhole}
              className="text-muted-foreground hover:text-foreground h-7 gap-1 px-2 text-xs"
            >
              <Undo2 className="size-3" />
              Undo
            </Button>
          )}
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

// ── Main dialog ─────────────────────────────────────────

export function ReviewDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { saving, publish, deleteDraft, blob, live, holdDraftDrop, releaseDraftDrop } = useDataset();
  const [discardOpen, setDiscardOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Prevent auto-drop while the review dialog is open
  useEffect(() => {
    if (!open) return;
    holdDraftDrop();
    return () => releaseDraftDrop();
  }, [open, holdDraftDrop, releaseDraftDrop]);

  const diff = live && blob ? computeDatasetDiff(live.data, blob) : null;
  const changeCount = diff?.totalChanges ?? 0;

  async function handlePublish() {
    await publish();
    onOpenChange(false);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
          <DialogHeader className="shrink-0 px-6 pt-6 pb-4">
            <DialogTitle className="text-lg">
              Review changes
              <span className="text-muted-foreground ml-2 text-sm font-normal">
                {changeCount} {changeCount === 1 ? "change" : "changes"}
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-4">
            <ReviewTab onNavigate={() => onOpenChange(false)} />
          </div>

          <DialogFooter className="shrink-0 border-t px-6 py-4">
            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive mr-auto"
              onClick={() => setDiscardOpen(true)}
              disabled={saving || changeCount === 0}
            >
              <Trash2 className="size-4" />
              Discard draft
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {changeCount === 0 ? "Close" : "Keep editing"}
            </Button>
            <Button onClick={handlePublish} disabled={saving || changeCount === 0}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            <Button variant="outline" onClick={() => setDiscardOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleting}
              onClick={async () => {
                setDeleting(true);
                try {
                  await deleteDraft();
                  setDiscardOpen(false);
                  onOpenChange(false);
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
