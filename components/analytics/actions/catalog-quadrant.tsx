"use client";

import { useMemo } from "react";
import { CartesianGrid, Cell, ReferenceLine, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts";
import {
  QUADRANT_COLORS,
  QuadrantLegend,
  type QuadrantPoint,
  QuadrantTooltip
} from "@/components/analytics/actions/catalog-quadrant-overlay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActionLeaderboardRow } from "@/lib/analytics/actions-api";

type Props = {
  rows: ActionLeaderboardRow[];
  minAdoption?: number;
};

function median(values: number[]) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

export function CatalogQuadrant({ rows, minAdoption = 1 }: Props) {
  const { points, xMedian, yMedian, useLogScale } = useMemo(() => {
    const filtered = rows.filter((r) => r.adoption_count >= minAdoption);
    if (filtered.length === 0) return { points: [] as QuadrantPoint[], xMedian: 0, yMedian: 0, useLogScale: false };

    const xValues = filtered.map((r) => r.adoption_count);
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const logScale = xMin > 0 && xMax / xMin >= 4;

    const xMed = median(xValues);
    const yMed = median(filtered.map((r) => r.completion_rate));

    const pts: QuadrantPoint[] = filtered.map((r) => {
      const aboveX = r.adoption_count > xMed;
      const aboveY = r.completion_rate > yMed;
      let quadrant: QuadrantPoint["quadrant"];
      if (r.adoption_count === xMed || r.completion_rate === yMed) quadrant = "boundary";
      else if (aboveX && aboveY) quadrant = "star";
      else if (!aboveX && aboveY) quadrant = "niche";
      else if (aboveX && !aboveY) quadrant = "popular_failing";
      else quadrant = "kill";

      return {
        id: `${r.action_type}:${r.action_id}`,
        x: r.adoption_count,
        y: r.completion_rate * 100,
        size: r.adoption_count,
        title: r.title ?? `#${r.action_id}`,
        adoption_count: r.adoption_count,
        completion_count: r.completion_count,
        completion_rate: r.completion_rate,
        quadrant
      };
    });

    return { points: pts, xMedian: xMed, yMedian: yMed * 100, useLogScale: logScale };
  }, [rows, minAdoption]);

  if (points.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Catalog health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">No actions adopted in this range.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Catalog health</CardTitle>
        <p className="text-xs text-muted-foreground">
          X = adoption count (log). Y = completion rate. Quadrant boundaries are the medians of each axis. Top-right
          stars, bottom-left kill candidates.
        </p>
      </CardHeader>
      <CardContent>
        <div style={{ width: "100%", height: 380, position: "relative" }}>
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
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              label={{
                value: useLogScale ? "Adoption (log)" : "Adoption",
                position: "insideBottom",
                offset: -16,
                style: { fontSize: 11, fill: "var(--muted-foreground)" }
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Completion rate"
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              label={{
                value: "Completion rate (%)",
                angle: -90,
                position: "insideLeft",
                offset: 8,
                style: { fontSize: 11, fill: "var(--muted-foreground)" }
              }}
            />
            <ZAxis type="number" dataKey="size" range={[30, 360]} />
            <ReferenceLine
              x={xMedian}
              stroke="var(--muted-foreground)"
              strokeDasharray="3 3"
              strokeOpacity={0.4}
              label={{
                value: "median",
                position: "top",
                style: { fontSize: 10, fill: "var(--muted-foreground)" }
              }}
            />
            <ReferenceLine y={yMedian} stroke="var(--muted-foreground)" strokeDasharray="3 3" strokeOpacity={0.4} />
            <Tooltip cursor={{ strokeDasharray: "3 3", stroke: "var(--border)" }} content={QuadrantTooltip} />
            <Scatter data={points} fillOpacity={0.75}>
              {points.map((point) => (
                <Cell key={point.id} fill={QUADRANT_COLORS[point.quadrant]} />
              ))}
            </Scatter>
          </ScatterChart>

          <QuadrantLegend />
        </div>
      </CardContent>
    </Card>
  );
}
