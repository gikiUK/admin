"use client";

import { Bar, BarChart, Cell, ReferenceLine, Tooltip, XAxis, YAxis } from "recharts";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import type { FunnelDurationStats } from "@/lib/analytics/actions-api";

type Props = {
  stats: FunnelDurationStats;
};

const HISTOGRAM_CONFIG = {
  count: { label: "Actions", color: "var(--primary)" }
} satisfies ChartConfig;

type Bucket = FunnelDurationStats["histogram"][number];

function isMedianBucket(bucket: Bucket, medianDays: number | null): boolean {
  if (medianDays === null) return false;
  return medianDays >= bucket.lower_days && (bucket.upper_days === null || medianDays < bucket.upper_days);
}

export function DurationHistogram({ stats }: Props) {
  const medianRange = stats.histogram.find((b) => isMedianBucket(b, stats.median_days))?.range;

  return (
    <ChartContainer config={HISTOGRAM_CONFIG} className="w-full" style={{ height: 140 }}>
      <BarChart data={stats.histogram} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="range"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
        />
        <YAxis hide allowDecimals={false} />
        <Tooltip
          cursor={{ fill: "var(--muted)" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const bucket = payload[0].payload as Bucket;
            return (
              <div className="rounded-md border bg-popover px-2 py-1 text-xs shadow-md">
                <span className="font-medium">{bucket.range}</span>
                <span className="ml-2 text-muted-foreground">{bucket.count}</span>
              </div>
            );
          }}
        />
        <Bar dataKey="count" radius={[2, 2, 0, 0]}>
          {stats.histogram.map((bucket) => (
            <Cell
              key={bucket.range}
              fill={isMedianBucket(bucket, stats.median_days) ? "var(--primary)" : "hsl(220, 8%, 70%)"}
            />
          ))}
        </Bar>
        {medianRange && (
          <ReferenceLine x={medianRange} stroke="var(--primary)" strokeDasharray="3 3" strokeOpacity={0.6} />
        )}
      </BarChart>
    </ChartContainer>
  );
}
