"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import type { NotableHighlight } from "@/components/analytics/insights/facts/notable-differences-builder";

type Props = {
  highlight: NotableHighlight;
};

export function NotableDifferenceCard({ highlight }: Props) {
  const up = highlight.delta > 0;
  const deltaTone = up ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400";

  return (
    <li className="rounded-md border bg-card p-3">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground truncate" title={highlight.factLabel}>
        {highlight.factLabel}
      </div>
      <div className="mt-0.5 truncate text-sm font-medium" title={highlight.valueLabel}>
        {highlight.valueLabel}
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className={`inline-flex items-center gap-0.5 text-base font-semibold tabular-nums ${deltaTone}`}>
          {up ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />}
          {Math.abs(highlight.delta * 100).toFixed(0)} pts
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {(highlight.cohortShare * 100).toFixed(0)}% vs {(highlight.baselineShare * 100).toFixed(0)}%
        </span>
      </div>
    </li>
  );
}
