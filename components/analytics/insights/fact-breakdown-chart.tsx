"use client";

import { X } from "lucide-react";
import { useMemo } from "react";
import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { FactBreakdown } from "@/lib/analytics/insights/insights-api";
import { useLiveDataset } from "@/lib/analytics/use-live-dataset";

type Props = {
  breakdown: FactBreakdown;
  onRemove?: () => void;
};

const CHART_CONFIG = {
  count: { label: "Orgs", color: "var(--primary)" }
} satisfies ChartConfig;

const BAR_HEIGHT = 24;
const Y_AXIS_WIDTH = 180;

export function FactBreakdownChart({ breakdown, onRemove }: Props) {
  const { data: dataset } = useLiveDataset();

  const { title, valueLabels } = useMemo(() => {
    const question = dataset?.data.questions.find((q) => q.key === breakdown.key);

    const labelLookup = new Map<string, string>();
    if (question) {
      const optionPairs = question.options?.length
        ? question.options
        : question.options_ref
          ? (dataset?.data.constants[question.options_ref] ?? []).map((c) => ({
              value: c.name,
              label: c.label ?? c.name
            }))
          : [];
      for (const opt of optionPairs) {
        labelLookup.set(String(opt.value), opt.label);
      }
    }

    return {
      title: question?.label ?? breakdown.key,
      valueLabels: labelLookup
    };
  }, [dataset, breakdown.key]);

  const data = useMemo(() => {
    return breakdown.values.map((v) => ({
      ...v,
      label: v.value === null ? "(unanswered)" : (valueLabels.get(String(v.value)) ?? String(v.value))
    }));
  }, [breakdown.values, valueLabels]);

  const height = Math.max(data.length * BAR_HEIGHT + 32, 120);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <div>
          <CardTitle className="text-sm">{title}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {breakdown.key}
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
