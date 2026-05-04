"use client";

import { Bar, BarChart, Cell, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

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

export function TopActionTypes({ items }: TopActionTypesProps) {
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
            <BarChart layout="vertical" data={items} margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
              <XAxis type="number" hide allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="action_type"
                tickLine={false}
                axisLine={false}
                width={160}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              />
              <ChartTooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltipContent indicator="line" />} />
              <Bar dataKey="count" radius={[3, 3, 3, 3]}>
                {items.map((item) => (
                  <Cell key={item.action_type} fill="var(--color-count)" />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
