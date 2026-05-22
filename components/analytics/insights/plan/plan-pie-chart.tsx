"use client";

import { Cell, Pie, PieChart, Tooltip } from "recharts";
import type { PlanSlice } from "@/components/analytics/insights/plan/plan-breakdown-slices";
import { PlanPieTooltip } from "@/components/analytics/insights/plan/plan-pie-tooltip";
import { ChartContainer } from "@/components/ui/chart";

type Props = {
  slices: PlanSlice[];
  size: number;
};

export function PlanPieChart({ slices, size }: Props) {
  return (
    <ChartContainer config={{}} className="shrink-0" style={{ width: size, height: size }}>
      <PieChart>
        <Pie
          data={slices}
          dataKey="count"
          nameKey="label"
          cx="50%"
          cy="50%"
          innerRadius={size * 0.28}
          outerRadius={size * 0.46}
          strokeWidth={1}
          stroke="var(--background)"
          isAnimationActive={false}
        >
          {slices.map((slice) => (
            <Cell key={slice.key} fill={slice.fill} />
          ))}
        </Pie>
        <Tooltip cursor={false} content={<PlanPieTooltip />} />
      </PieChart>
    </ChartContainer>
  );
}
