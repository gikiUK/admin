"use client";

import { cn } from "@/lib/utils";

type Tone = "cohort" | "baseline";

type Props = {
  share: number;
  tone: Tone;
  count?: number;
};

export function FillBar({ share, tone, count }: Props) {
  // Floor at 1% so tiny non-zero shares still show.
  const widthPercent = Math.max(share * 100, share > 0 ? 1 : 0);

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn("h-2 flex-1 overflow-hidden rounded-full", tone === "cohort" ? "bg-primary/10" : "bg-muted")}
        aria-hidden
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width]",
            tone === "cohort" ? "bg-primary" : "bg-muted-foreground/40"
          )}
          style={{ width: `${widthPercent}%` }}
        />
      </div>
      {tone === "baseline" && (
        <span className="w-16 shrink-0 text-right text-[10px] uppercase tracking-wide tabular-nums text-muted-foreground">
          baseline {(share * 100).toFixed(0)}%{count !== undefined && count > 0 && ` (${count})`}
        </span>
      )}
      {tone === "cohort" && (
        <span className="w-16 shrink-0 text-right text-[10px] uppercase tracking-wide tabular-nums text-primary/70">
          cohort
        </span>
      )}
    </div>
  );
}
