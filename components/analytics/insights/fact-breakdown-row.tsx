"use client";

import { cn } from "@/lib/utils";

type PairedRowProps = {
  label: string;
  cohortShare: number;
  baselineShare: number;
  cohortCount: number;
  baselineCount: number;
  showBaseline: boolean;
  isActive: boolean;
  clickable: boolean;
  onClick: () => void;
};

export function FactBreakdownPairedRow({
  label,
  cohortShare,
  baselineShare,
  cohortCount,
  baselineCount,
  showBaseline,
  isActive,
  clickable,
  onClick
}: PairedRowProps) {
  const delta = (cohortShare - baselineShare) * 100;
  const deltaLabel =
    showBaseline && Math.abs(delta) >= 1 ? `${delta > 0 ? "+" : "−"}${Math.abs(delta).toFixed(0)} pts` : "";
  const deltaTone = delta > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400";

  const content = (
    <div
      className={cn(
        "rounded-md px-2.5 py-2 transition-colors",
        clickable && "cursor-pointer hover:bg-muted/50",
        isActive && "bg-primary/5 ring-1 ring-primary/30"
      )}
    >
      <div className="flex items-baseline justify-between gap-3 text-xs">
        <span className="truncate font-medium text-foreground" title={label}>
          {label}
        </span>
        <span className="flex shrink-0 items-baseline gap-2 tabular-nums">
          <span className="text-foreground">
            {cohortCount}
            <span className="text-muted-foreground"> ({(cohortShare * 100).toFixed(0)}%)</span>
          </span>
          {showBaseline && deltaLabel && <span className={cn("text-[11px] font-medium", deltaTone)}>{deltaLabel}</span>}
        </span>
      </div>
      <div className="mt-1.5 space-y-1">
        <FillBar share={cohortShare} tone="cohort" />
        {showBaseline && <FillBar share={baselineShare} tone="baseline" count={baselineCount} />}
      </div>
    </div>
  );

  if (!clickable) return content;
  return (
    <button type="button" onClick={onClick} className="block w-full text-left">
      {content}
    </button>
  );
}

function FillBar({ share, tone, count }: { share: number; tone: "cohort" | "baseline"; count?: number }) {
  const widthPercent = Math.max(share * 100, share > 0 ? 1 : 0); // floor at 1% so tiny non-zero shares still show
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
