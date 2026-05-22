"use client";

import { Sparkline } from "@/components/analytics/actions/trends/sparkline";
import type { ActionTrendRow } from "@/lib/analytics/actions-api";

type Props = {
  row: ActionTrendRow;
  color: string;
};

export function TrendRow({ row, color }: Props) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-md border bg-card px-3 py-2">
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{row.title ?? `#${row.action_id}`}</div>
        <div className="text-xs text-muted-foreground">
          {row.total} total · slope {row.slope > 0 ? "+" : ""}
          {row.slope.toFixed(2)}/wk
        </div>
      </div>
      <Sparkline counts={row.counts} color={color} />
    </li>
  );
}
