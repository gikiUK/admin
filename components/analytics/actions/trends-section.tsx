"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActionTrendRow, ActionTrends } from "@/lib/analytics/actions-api";

type Props = {
  data: ActionTrends;
  topN?: number;
};

const SPARK_WIDTH = 80;
const SPARK_HEIGHT = 24;

export function TrendsSection({ data, topN = 5 }: Props) {
  const sorted = [...data.actions].sort((a, b) => b.slope - a.slope);
  const risers = sorted.filter((r) => r.slope > 0).slice(0, topN);
  const fallers = sorted
    .filter((r) => r.slope < 0)
    .slice(-topN)
    .reverse();

  if (risers.length === 0 && fallers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">No trend signal in the last {data.weeks} weeks.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Risers and fallers</CardTitle>
        <p className="text-xs text-muted-foreground">
          Weekly adoption over the last {data.weeks} weeks. Ranking by least-squares slope.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <TrendList title="Risers" rows={risers} direction="up" />
          <TrendList title="Fallers" rows={fallers} direction="down" />
        </div>
      </CardContent>
    </Card>
  );
}

function TrendList({ title, rows, direction }: { title: string; rows: ActionTrendRow[]; direction: "up" | "down" }) {
  const color = direction === "up" ? "hsl(140, 60%, 40%)" : "hsl(0, 65%, 55%)";

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</h3>
      {rows.length === 0 ? (
        <div className="text-xs text-muted-foreground">No clear {title.toLowerCase()}.</div>
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => (
            <li
              key={`${row.action_type}-${row.action_id}`}
              className="flex items-center justify-between gap-3 rounded-md border bg-card px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{row.title ?? `#${row.action_id}`}</div>
                <div className="text-xs text-muted-foreground">
                  {row.total} total · slope {row.slope > 0 ? "+" : ""}
                  {row.slope.toFixed(2)}/wk
                </div>
              </div>
              <Sparkline counts={row.counts} color={color} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Sparkline({ counts, color }: { counts: number[]; color: string }) {
  if (counts.length === 0) return null;
  const max = Math.max(...counts, 1);
  const stepX = counts.length > 1 ? SPARK_WIDTH / (counts.length - 1) : SPARK_WIDTH;
  const points = counts
    .map((value, i) => {
      const x = i * stepX;
      const y = SPARK_HEIGHT - (value / max) * (SPARK_HEIGHT - 2) - 1;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  const last = counts[counts.length - 1];
  const lastX = (counts.length - 1) * stepX;
  const lastY = SPARK_HEIGHT - (last / max) * (SPARK_HEIGHT - 2) - 1;

  return (
    <svg
      width={SPARK_WIDTH}
      height={SPARK_HEIGHT}
      viewBox={`0 0 ${SPARK_WIDTH} ${SPARK_HEIGHT}`}
      role="img"
      aria-label="Weekly adoption sparkline"
    >
      <title>Weekly adoption sparkline</title>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={lastX} cy={lastY} r={2} fill={color} />
    </svg>
  );
}
