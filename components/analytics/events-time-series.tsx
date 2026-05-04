"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

type EventsTimeSeriesProps = {
  data: Array<{ date: string; count: number }>;
};

const CHART_CONFIG = {
  count: {
    label: "Events",
    color: "var(--primary)"
  }
} satisfies ChartConfig;

function formatTick(value: string): string {
  const date = new Date(value);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function EventsTimeSeries({ data }: EventsTimeSeriesProps) {
  const total = useMemo(() => data.reduce((sum, point) => sum + point.count, 0), [data]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-baseline justify-between gap-2">
        <CardTitle className="text-base">Activity</CardTitle>
        <span className="text-sm text-muted-foreground tabular-nums">{total.toLocaleString()} total</span>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-sm text-muted-foreground">No events in range.</div>
        ) : (
          <ChartContainer config={CHART_CONFIG} className="h-[240px] w-full">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={formatTick}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} width={32} allowDecimals={false} />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent labelFormatter={(value) => formatTick(String(value))} indicator="line" />}
              />
              <Bar dataKey="count" fill="var(--color-count)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
