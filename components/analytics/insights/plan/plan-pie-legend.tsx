"use client";

import type { PlanSlice } from "@/components/analytics/insights/plan/plan-breakdown-slices";

type Props = {
  slices: PlanSlice[];
  maxHeight: number;
};

export function PlanPieLegend({ slices, maxHeight }: Props) {
  return (
    <ul className="flex-1 space-y-1 overflow-y-auto pr-1 text-xs" style={{ maxHeight }}>
      {slices.map((slice) => (
        <li key={slice.key} className="flex items-center gap-2">
          <span
            className="inline-block size-2.5 shrink-0 rounded-sm"
            style={{ backgroundColor: slice.fill }}
            aria-hidden
          />
          <span className="flex-1 truncate" title={slice.label}>
            {slice.label}
          </span>
          <span className="tabular-nums text-foreground">{slice.count}</span>
          <span className="w-10 text-right tabular-nums text-muted-foreground">{(slice.share * 100).toFixed(0)}%</span>
        </li>
      ))}
    </ul>
  );
}
