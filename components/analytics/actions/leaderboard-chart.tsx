"use client";

import { useMemo } from "react";
import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import type { ActionLeaderboardRow } from "@/lib/analytics/actions-api";

type Props = {
  rows: ActionLeaderboardRow[];
  limit?: number;
};

const CHART_CONFIG = {
  adoption_count: { label: "Adoption", color: "var(--primary)" }
} satisfies ChartConfig;

const BAR_HEIGHT = 22;
const Y_AXIS_WIDTH = 280;
const MIN_RATE_FOR_FULL_GREEN = 0.5;

function completionColor(rate: number): string {
  // 0 = red, 0.5+ = green. HSL hue 0 → 130.
  const clamped = Math.min(rate, MIN_RATE_FOR_FULL_GREEN) / MIN_RATE_FOR_FULL_GREEN;
  const hue = Math.round(clamped * 130);
  return `hsl(${hue}, 65%, 45%)`;
}

type ChartRow = ActionLeaderboardRow & { label: string };

function disambiguate(rows: ActionLeaderboardRow[]): ChartRow[] {
  const seen = new Map<string, number>();
  return rows.map((row) => {
    const base = row.title ?? `#${row.action_id}`;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    const label = count === 0 ? base : `${base} (#${row.action_id})`;
    return { ...row, label };
  });
}

export function LeaderboardChart({ rows, limit = 20 }: Props) {
  const data = useMemo(() => disambiguate(rows.slice(0, limit)), [rows, limit]);
  const height = Math.max(data.length * BAR_HEIGHT + 32, 160);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top actions by adoption</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">No actions picked in this range.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top actions by adoption</CardTitle>
        <p className="text-xs text-muted-foreground">
          Bar color: completion rate (red 0% → green {Math.round(MIN_RATE_FOR_FULL_GREEN * 100)}%+).
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={CHART_CONFIG} className="w-full" style={{ height }}>
          <BarChart layout="vertical" data={data} margin={{ top: 0, right: 56, left: 0, bottom: 0 }}>
            <XAxis type="number" hide allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="label"
              tickLine={false}
              axisLine={false}
              width={Y_AXIS_WIDTH}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              interval={0}
            />
            <ChartTooltip
              cursor={{ fill: "var(--muted)" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0].payload as ActionLeaderboardRow;
                return (
                  <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
                    <div className="font-medium">{row.title ?? `#${row.action_id}`}</div>
                    <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 text-muted-foreground">
                      <span>Adoption</span>
                      <span className="text-right text-foreground">{row.adoption_count}</span>
                      <span>Completed</span>
                      <span className="text-right text-foreground">{row.completion_count}</span>
                      <span>Completion</span>
                      <span className="text-right text-foreground">{(row.completion_rate * 100).toFixed(1)}%</span>
                      <span>Stale</span>
                      <span className="text-right text-foreground">{row.stale_count}</span>
                      {row.median_time_to_complete_days !== null && (
                        <>
                          <span>Median TTC</span>
                          <span className="text-right text-foreground">
                            {row.median_time_to_complete_days.toFixed(1)}d
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                );
              }}
            />
            <Bar dataKey="adoption_count" radius={[3, 3, 3, 3]}>
              {data.map((row) => (
                <Cell key={`${row.action_type}-${row.action_id}`} fill={completionColor(row.completion_rate)} />
              ))}
              <LabelList
                dataKey="adoption_count"
                position="right"
                offset={6}
                fontSize={11}
                fill="var(--muted-foreground)"
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
