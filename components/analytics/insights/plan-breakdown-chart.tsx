"use client";

import { X } from "lucide-react";
import { useMemo } from "react";
import { Cell, Pie, PieChart, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import type { PlanBreakdown, PlanBreakdownValue } from "@/lib/analytics/insights/insights-api";

type Props = {
  breakdown: PlanBreakdown;
  onRemove?: () => void;
};

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

const PIE_SIZE = 160;
const UNSET_COLOR = "hsl(220, 8%, 60%)";

// Distinct hues spread across the wheel; lifted into the muted range so charts stay calm.
function sliceColor(index: number, total: number): string {
  const hue = Math.round((index * 360) / Math.max(total, 1));
  return `hsl(${hue}, 55%, 55%)`;
}

function humanize(raw: PlanBreakdownValue["value"]): string {
  if (raw === null) return "(unset)";
  if (typeof raw === "boolean") return raw ? "Yes" : "No";
  return String(raw)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

type Slice = {
  key: string;
  label: string;
  count: number;
  share: number;
  fill: string;
};

export function PlanBreakdownChart({ breakdown, onRemove }: Props) {
  const slices: Slice[] = useMemo(() => {
    const sorted = [...breakdown.values].sort((a, b) => b.count - a.count);
    const realSliceCount = sorted.filter((v) => v.value !== null).length;
    let colorIndex = 0;

    return sorted.map((v) => {
      const isUnset = v.value === null;
      const fill = isUnset ? UNSET_COLOR : sliceColor(colorIndex++, realSliceCount);
      return {
        key: String(v.value),
        label: humanize(v.value),
        count: v.count,
        share: v.share,
        fill
      };
    });
  }, [breakdown.values]);

  const title = METADATA_KEY_LABELS[breakdown.key] ?? breakdown.key;
  const hasData = slices.length > 0 && slices.some((s) => s.count > 0);

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
        {!hasData ? (
          <div className="text-xs text-muted-foreground">No data.</div>
        ) : (
          <div className="flex items-center gap-4">
            <ChartContainer config={{}} className="shrink-0" style={{ width: PIE_SIZE, height: PIE_SIZE }}>
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={PIE_SIZE * 0.28}
                  outerRadius={PIE_SIZE * 0.46}
                  strokeWidth={1}
                  stroke="var(--background)"
                  isAnimationActive={false}
                >
                  {slices.map((slice) => (
                    <Cell key={slice.key} fill={slice.fill} />
                  ))}
                </Pie>
                <Tooltip
                  cursor={false}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const slice = payload[0].payload as Slice;
                    return (
                      <div className="rounded-md border bg-popover px-2 py-1 text-xs shadow-md">
                        <div className="font-medium">{slice.label}</div>
                        <div className="text-muted-foreground">
                          {slice.count} ({(slice.share * 100).toFixed(1)}%)
                        </div>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ChartContainer>

            <ul className="flex-1 space-y-1 overflow-y-auto pr-1 text-xs" style={{ maxHeight: PIE_SIZE }}>
              {slices.map((slice) => (
                <li key={slice.key} className="flex items-center gap-2">
                  <span
                    className="inline-block size-2.5 shrink-0 rounded-sm"
                    style={{ backgroundColor: slice.fill }}
                    aria-hidden
                  />
                  <span className="flex-1 truncate" title={slice.label}>
                    {slice.label}
                  </span>
                  <span className="tabular-nums text-foreground">{slice.count}</span>
                  <span className="w-10 text-right tabular-nums text-muted-foreground">
                    {(slice.share * 100).toFixed(0)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
