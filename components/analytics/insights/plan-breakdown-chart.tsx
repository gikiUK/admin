"use client";

import { X } from "lucide-react";
import { useMemo } from "react";
import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { PlanBreakdown } from "@/lib/analytics/insights/insights-api";

type Props = {
  breakdown: PlanBreakdown;
  onRemove?: () => void;
};

const CHART_CONFIG = {
  count: { label: "Actions", color: "var(--primary)" }
} satisfies ChartConfig;

const BAR_HEIGHT = 24;
const Y_AXIS_WIDTH = 200;

export const METADATA_KEY_LABELS: Record<string, string> = {
  impact_opportunity: "Impact opportunity",
  cost_saving_potential: "Cost saving potential",
  business_growth_potential: "Business growth potential",
  implementation_time_est: "Implementation time",
  payback_est: "Payback period",
  theme: "Theme",
  category: "Category",
  ghg_scope: "GHG scope",
  ghg_categories: "GHG categories",
  sub_themes: "Sub-themes",
  industry: "Industry",
  sector: "Sector",
  business_size: "Business size",
  opex_or_capex: "Opex / Capex"
};

function humanize(raw: string | number | boolean | null): string {
  if (raw === null) return "(unset)";
  if (typeof raw === "boolean") return raw ? "Yes" : "No";
  const s = String(raw);
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function PlanBreakdownChart({ breakdown, onRemove }: Props) {
  const data = useMemo(
    () =>
      breakdown.values.map((v) => ({
        ...v,
        label: humanize(v.value)
      })),
    [breakdown.values]
  );

  const height = Math.max(data.length * BAR_HEIGHT + 32, 120);
  const title = METADATA_KEY_LABELS[breakdown.key] ?? breakdown.key;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <div>
          <CardTitle className="text-sm">{title}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {breakdown.total_with_metadata} actions
            {breakdown.missing_metadata > 0 && ` · ${breakdown.missing_metadata} missing metadata`}
            {breakdown.note && ` · ${breakdown.note}`}
          </p>
        </div>
        {onRemove && (
          <Button variant="ghost" size="icon" onClick={onRemove} aria-label="Remove" className="size-7">
            <X className="size-3.5" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-xs text-muted-foreground">No data.</div>
        ) : (
          <ChartContainer config={CHART_CONFIG} className="w-full" style={{ height }}>
            <BarChart layout="vertical" data={data} margin={{ top: 0, right: 64, left: 0, bottom: 0 }}>
              <XAxis type="number" hide allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="label"
                tickLine={false}
                axisLine={false}
                width={Y_AXIS_WIDTH}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                interval={0}
              />
              <ChartTooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltipContent indicator="line" />} />
              <Bar dataKey="count" radius={[3, 3, 3, 3]}>
                {data.map((row) => (
                  <Cell
                    key={String(row.value)}
                    fill={row.value === null ? "var(--muted-foreground)" : "var(--color-count)"}
                  />
                ))}
                <LabelList
                  dataKey="count"
                  position="right"
                  offset={6}
                  fontSize={11}
                  fill="var(--muted-foreground)"
                  formatter={(value) => {
                    if (typeof value !== "number") return value;
                    const row = data.find((d) => d.count === value);
                    const share = row ? `${(row.share * 100).toFixed(0)}%` : "";
                    return `${value} (${share})`;
                  }}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
