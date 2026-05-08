"use client";

import { useMemo } from "react";
import { Bar, BarChart, Cell, PolarAngleAxis, PolarGrid, Radar, RadarChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

type TopCompletedActionsProps = {
  items: Array<{ action_type: string; count: number }>;
};

const CHART_CONFIG = {
  count: {
    label: "Completions",
    color: "var(--primary)"
  }
} satisfies ChartConfig;

const RADAR_MIN_AXES = 3;
const BAR_HEIGHT = 28;

function humanize(value: string): string {
  const cleaned = value.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
}

export function TopCompletedActions({ items }: TopCompletedActionsProps) {
  const chartData = useMemo(() => items.map((item) => ({ ...item, label: humanize(item.action_type) })), [items]);

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top completed action types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">No completions in range.</div>
        </CardContent>
      </Card>
    );
  }

  if (items.length < RADAR_MIN_AXES) {
    const height = Math.max(items.length * BAR_HEIGHT + 24, 96);
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top completed action types</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={CHART_CONFIG} className="w-full" style={{ height }}>
            <BarChart layout="vertical" data={chartData} margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
              <XAxis type="number" hide allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="label"
                tickLine={false}
                axisLine={false}
                width={160}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              />
              <ChartTooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltipContent indicator="line" />} />
              <Bar dataKey="count" radius={[3, 3, 3, 3]}>
                {chartData.map((item) => (
                  <Cell key={item.action_type} fill="var(--color-count)" />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top completed action types</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={CHART_CONFIG} className="mx-auto aspect-square w-full max-w-[360px]">
          <RadarChart data={chartData} margin={{ top: 24, right: 48, bottom: 24, left: 48 }}>
            <PolarGrid stroke="var(--border)" />
            <PolarAngleAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
            <Radar
              dataKey="count"
              stroke="var(--color-count)"
              fill="var(--color-count)"
              fillOpacity={0.35}
              dot={{ r: 3, fill: "var(--color-count)" }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
