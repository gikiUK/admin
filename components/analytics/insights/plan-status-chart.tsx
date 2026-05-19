"use client";

import { useMemo } from "react";
import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const CHART_CONFIG = {
  count: { label: "Actions", color: "var(--primary)" }
} satisfies ChartConfig;

const STATUS_ORDER = ["not_started", "in_progress", "completed", "archived", "rejected"];

const STATUS_COLOR: Record<string, string> = {
  not_started: "hsl(220, 8%, 55%)",
  in_progress: "hsl(220, 70%, 55%)",
  completed: "hsl(140, 60%, 40%)",
  archived: "hsl(35, 70%, 50%)",
  rejected: "hsl(0, 65%, 55%)"
};

type Props = {
  byStatus: Record<string, number>;
};

export function PlanStatusChart({ byStatus }: Props) {
  const data = useMemo(() => {
    return STATUS_ORDER.filter((s) => byStatus[s] !== undefined && byStatus[s] !== null).map((status) => ({
      status,
      label: status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      count: byStatus[status] ?? 0
    }));
  }, [byStatus]);

  const total = data.reduce((acc, d) => acc + d.count, 0);

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Plan actions by status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">No plan actions in the cohort.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Plan actions by status</CardTitle>
        <p className="text-xs text-muted-foreground">{total.toLocaleString()} tracked actions</p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={CHART_CONFIG} className="w-full" style={{ height: data.length * 28 + 32 }}>
          <BarChart layout="vertical" data={data} margin={{ top: 0, right: 80, left: 0, bottom: 0 }}>
            <XAxis type="number" hide allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="label"
              tickLine={false}
              axisLine={false}
              width={140}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              interval={0}
            />
            <ChartTooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltipContent indicator="line" />} />
            <Bar dataKey="count" radius={[3, 3, 3, 3]}>
              {data.map((row) => (
                <Cell key={row.status} fill={STATUS_COLOR[row.status] ?? "var(--primary)"} />
              ))}
              <LabelList
                dataKey="count"
                position="right"
                offset={6}
                fontSize={11}
                fill="var(--muted-foreground)"
                formatter={(value) => {
                  if (typeof value !== "number") return value;
                  const share = total === 0 ? 0 : (value / total) * 100;
                  return `${value} (${share.toFixed(0)}%)`;
                }}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
