"use client";

import { Bar, BarChart, Cell, ReferenceLine, Tooltip, XAxis, YAxis } from "recharts";
import { FunnelSankey } from "@/components/analytics/actions/funnel-sankey";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import type { ActionFunnel, FunnelDurationStats } from "@/lib/analytics/actions-api";

type Props = {
  data: ActionFunnel;
};

export function FunnelSection({ data }: Props) {
  const { kpis } = data;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Kpi label="Created" value={kpis.created.toLocaleString()} />
        <Kpi label="Reached in progress" value={kpis.reached_in_progress.toLocaleString()} />
        <Kpi label="Completed" value={kpis.completed.toLocaleString()} />
        <Kpi label="Completion rate" value={`${(kpis.completion_rate * 100).toFixed(1)}%`} />
        <Kpi
          label="Median time to complete"
          value={kpis.median_time_to_complete_days !== null ? `${kpis.median_time_to_complete_days.toFixed(1)}d` : "—"}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lifecycle funnel</CardTitle>
          <p className="text-xs text-muted-foreground">
            Each tracked action created in range is followed by its first lifecycle outcome.
          </p>
        </CardHeader>
        <CardContent>
          <FunnelSankey data={data} />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <DurationCard title="Created → In progress" stats={data.durations.created_to_in_progress} />
        <DurationCard title="In progress → Completed" stats={data.durations.in_progress_to_completed} />
        <DurationCard title="Created → Completed" stats={data.durations.created_to_completed} />
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
      </CardContent>
    </Card>
  );
}

const HISTOGRAM_CONFIG = {
  count: { label: "Actions", color: "var(--primary)" }
} satisfies ChartConfig;

function DurationCard({ title, stats }: { title: string; stats: FunnelDurationStats }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
        <p className="text-xs text-muted-foreground">
          {stats.n.toLocaleString()} samples
          {stats.median_days !== null && ` · median ${stats.median_days.toFixed(1)}d`}
          {stats.p90_days !== null && ` · P90 ${stats.p90_days.toFixed(1)}d`}
        </p>
      </CardHeader>
      <CardContent>
        {stats.n === 0 ? (
          <div className="text-xs text-muted-foreground">No samples.</div>
        ) : (
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
                  const bucket = payload[0].payload as FunnelDurationStats["histogram"][number];
                  return (
                    <div className="rounded-md border bg-popover px-2 py-1 text-xs shadow-md">
                      <span className="font-medium">{bucket.range}</span>
                      <span className="ml-2 text-muted-foreground">{bucket.count}</span>
                    </div>
                  );
                }}
              />
              <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                {stats.histogram.map((bucket) => {
                  const inMedianBucket =
                    stats.median_days !== null &&
                    stats.median_days >= bucket.lower_days &&
                    (bucket.upper_days === null || stats.median_days < bucket.upper_days);
                  return <Cell key={bucket.range} fill={inMedianBucket ? "var(--primary)" : "hsl(220, 8%, 70%)"} />;
                })}
              </Bar>
              {stats.median_days !== null && (
                <ReferenceLine
                  x={
                    stats.histogram.find(
                      (b) =>
                        stats.median_days !== null &&
                        stats.median_days >= b.lower_days &&
                        (b.upper_days === null || stats.median_days < b.upper_days)
                    )?.range
                  }
                  stroke="var(--primary)"
                  strokeDasharray="3 3"
                  strokeOpacity={0.6}
                />
              )}
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
