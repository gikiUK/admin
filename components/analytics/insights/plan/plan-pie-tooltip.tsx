"use client";

import type { PlanSlice } from "@/components/analytics/insights/plan/plan-breakdown-slices";

type Props = {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: unknown }>;
};

export function PlanPieTooltip({ active, payload }: Props) {
  if (!active || !payload?.length) return null;
  const slice = payload[0].payload as PlanSlice;
  return (
    <div className="rounded-md border bg-popover px-2 py-1 text-xs shadow-md">
      <div className="font-medium">{slice.label}</div>
      <div className="text-muted-foreground">
        {slice.count} ({(slice.share * 100).toFixed(1)}%)
      </div>
    </div>
  );
}
