"use client";

import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from "recharts";
import { PLAN_STATUS_COLOR, type PlanStatusRow } from "@/components/analytics/insights/plan/plan-status-helpers";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const CHART_CONFIG = { count: { label: "Actions", color: "var(--primary)" } } satisfies ChartConfig;

type Props = {
  rows: PlanStatusRow[];
  total: number;
};

export function PlanStatusBarChart({ rows, total }: Props) {
  return (
    <ChartContainer config={CHART_CONFIG} className="w-full" style={{ height: rows.length * 28 + 32 }}>
      <BarChart layout="vertical" data={rows} margin={{ top: 0, right: 80, left: 0, bottom: 0 }}>
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
          {rows.map((row) => (
            <Cell key={row.status} fill={PLAN_STATUS_COLOR[row.status] ?? "var(--primary)"} />
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
  );
}
