"use client";

import { Minus, Plus } from "lucide-react";
import type { FieldChange } from "@/lib/blob/change-log";
import { computeSegments, type DiffSegment } from "@/lib/blob/dataset-diff";

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

export function InlineDiff({ details }: { details: FieldChange[] }) {
  if (details.length === 0) return null;

  return (
    <div className="mt-2 space-y-1.5">
      {details.map((d) => {
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
  );
}
