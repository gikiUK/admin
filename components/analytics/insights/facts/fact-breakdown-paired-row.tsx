"use client";

import { FillBar } from "@/components/analytics/insights/facts/fill-bar";
import { cn } from "@/lib/utils";

type Props = {
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
}: Props) {
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
