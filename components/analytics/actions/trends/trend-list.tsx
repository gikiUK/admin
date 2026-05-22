"use client";

import { TrendRow } from "@/components/analytics/actions/trends/trend-row";
import type { ActionTrendRow } from "@/lib/analytics/actions-api";

type Direction = "up" | "down";

type Props = {
  title: string;
  rows: ActionTrendRow[];
  direction: Direction;
};

const COLOR_BY_DIRECTION: Record<Direction, string> = {
  up: "hsl(140, 60%, 40%)",
  down: "hsl(0, 65%, 55%)"
};

export function TrendList({ title, rows, direction }: Props) {
  const color = COLOR_BY_DIRECTION[direction];
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</h3>
      {rows.length === 0 ? (
        <div className="text-xs text-muted-foreground">No clear {title.toLowerCase()}.</div>
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => (
            <TrendRow key={`${row.action_type}-${row.action_id}`} row={row} color={color} />
          ))}
        </ul>
      )}
    </div>
  );
}
