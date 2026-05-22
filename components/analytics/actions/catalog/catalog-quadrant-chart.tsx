"use client";

import { CartesianGrid, Cell, ReferenceLine, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts";
import { CatalogQuadrantTooltip } from "@/components/analytics/actions/catalog/catalog-quadrant-tooltip";
import { QUADRANT_COLORS, type QuadrantPoint } from "@/components/analytics/actions/catalog/catalog-types";

type Props = {
  points: QuadrantPoint[];
  xMedian: number;
  yMedian: number;
  useLogScale: boolean;
};

const TICK_STYLE = { fontSize: 11, fill: "var(--muted-foreground)" } as const;

export function CatalogQuadrantChart({ points, xMedian, yMedian, useLogScale }: Props) {
  return (
    <ScatterChart
      width={720}
      height={380}
      margin={{ top: 16, right: 24, bottom: 36, left: 36 }}
      style={{ width: "100%" }}
    >
      <CartesianGrid stroke="var(--border)" strokeOpacity={0.4} />
      <XAxis
        type="number"
        dataKey="x"
        name="Adoption"
        scale={useLogScale ? "log" : "linear"}
        domain={useLogScale ? ["auto", "auto"] : [0, "dataMax"]}
        allowDataOverflow={false}
        allowDuplicatedCategory={false}
        tick={TICK_STYLE}
        label={{
          value: useLogScale ? "Adoption (log)" : "Adoption",
          position: "insideBottom",
          offset: -16,
          style: TICK_STYLE
        }}
      />
      <YAxis
        type="number"
        dataKey="y"
        name="Completion rate"
        domain={[0, 100]}
        tick={TICK_STYLE}
        label={{
          value: "Completion rate (%)",
          angle: -90,
          position: "insideLeft",
          offset: 8,
          style: TICK_STYLE
        }}
      />
      <ZAxis type="number" dataKey="size" range={[30, 360]} />
      <ReferenceLine
        x={xMedian}
        stroke="var(--muted-foreground)"
        strokeDasharray="3 3"
        strokeOpacity={0.4}
        label={{ value: "median", position: "top", style: { fontSize: 10, fill: "var(--muted-foreground)" } }}
      />
      <ReferenceLine y={yMedian} stroke="var(--muted-foreground)" strokeDasharray="3 3" strokeOpacity={0.4} />
      <Tooltip cursor={{ strokeDasharray: "3 3", stroke: "var(--border)" }} content={<CatalogQuadrantTooltip />} />
      <Scatter data={points} fillOpacity={0.75}>
        {points.map((point) => (
          <Cell key={point.id} fill={QUADRANT_COLORS[point.quadrant]} />
        ))}
      </Scatter>
    </ScatterChart>
  );
}
