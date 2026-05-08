"use client";

import { useMemo } from "react";
import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { getEventDisplay } from "@/lib/analytics/event-display";

type TopActionTypesProps = {
  items: Array<{ action_type: string; count: number }>;
};

const CHART_CONFIG = {
  count: {
    label: "Events",
    color: "var(--primary)"
  }
} satisfies ChartConfig;

const BAR_HEIGHT = 28;
const Y_AXIS_WIDTH = 200;

export function TopActionTypes({ items }: TopActionTypesProps) {
  const chartData = useMemo(
    () => items.map((item) => ({ ...item, label: getEventDisplay(item.action_type).label })),
    [items]
  );
  const height = Math.max(items.length * BAR_HEIGHT + 24, 120);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top events</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-sm text-muted-foreground">No events in range.</div>
        ) : (
          <ChartContainer config={CHART_CONFIG} className="w-full" style={{ height }}>
            <BarChart layout="vertical" data={chartData} margin={{ top: 0, right: 48, left: 0, bottom: 0 }}>
              <XAxis type="number" hide allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="label"
                tickLine={false}
                axisLine={false}
                width={Y_AXIS_WIDTH}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              />
              <ChartTooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltipContent indicator="line" />} />
              <Bar dataKey="count" radius={[3, 3, 3, 3]}>
                {chartData.map((item) => (
                  <Cell key={item.action_type} fill="var(--color-count)" />
                ))}
                <LabelList dataKey="count" position="right" offset={6} fontSize={11} fill="var(--muted-foreground)" />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
