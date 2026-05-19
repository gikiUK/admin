"use client";

import { useMemo } from "react";
import { CartesianGrid, Cell, ReferenceLine, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActionLeaderboardRow } from "@/lib/analytics/actions-api";

type Props = {
  rows: ActionLeaderboardRow[];
  minAdoption?: number;
};

type Point = {
  id: string;
  x: number;
  y: number;
  size: number;
  title: string;
  adoption_count: number;
  completion_count: number;
  completion_rate: number;
  quadrant: "star" | "niche" | "popular_failing" | "kill" | "boundary";
};

const QUADRANT_COLORS: Record<Point["quadrant"], string> = {
  star: "hsl(140, 60%, 40%)",
  niche: "hsl(190, 55%, 45%)",
  popular_failing: "hsl(35, 70%, 50%)",
  kill: "hsl(0, 65%, 55%)",
  boundary: "hsl(220, 8%, 55%)"
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
    if (filtered.length === 0) return { points: [] as Point[], xMedian: 0, yMedian: 0, useLogScale: false };

    const xValues = filtered.map((r) => r.adoption_count);
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const logScale = xMin > 0 && xMax / xMin >= 4;

    const xMed = median(xValues);
    const yMed = median(filtered.map((r) => r.completion_rate));

    const pts: Point[] = filtered.map((r) => {
      const aboveX = r.adoption_count > xMed;
      const aboveY = r.completion_rate > yMed;
      let quadrant: Point["quadrant"];
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
            <Tooltip
              cursor={{ strokeDasharray: "3 3", stroke: "var(--border)" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const point = payload[0].payload as Point;
                return (
                  <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
                    <div className="font-medium">{point.title}</div>
                    <div className="text-muted-foreground">{quadrantLabel(point.quadrant)}</div>
                    <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 text-muted-foreground">
                      <span>Adoption</span>
                      <span className="text-right text-foreground">{point.adoption_count}</span>
                      <span>Completed</span>
                      <span className="text-right text-foreground">{point.completion_count}</span>
                      <span>Completion</span>
                      <span className="text-right text-foreground">{(point.completion_rate * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                );
              }}
            />
            <Scatter data={points} fillOpacity={0.75}>
              {points.map((point) => (
                <Cell key={point.id} fill={QUADRANT_COLORS[point.quadrant]} />
              ))}
            </Scatter>
          </ScatterChart>

          <div className="pointer-events-none absolute inset-0 grid grid-cols-2 grid-rows-2 p-3 text-[10px] uppercase tracking-wide">
            <div className="self-start justify-self-start text-muted-foreground/70">Niche but effective</div>
            <div className="self-start justify-self-end text-emerald-600/80 dark:text-emerald-400/80">Stars</div>
            <div className="self-end justify-self-start text-destructive/70">Kill candidates</div>
            <div className="self-end justify-self-end text-amber-600/80 dark:text-amber-400/80">
              Popular but failing
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function quadrantLabel(q: Point["quadrant"]) {
  switch (q) {
    case "star":
      return "Star — high adoption, high completion";
    case "niche":
      return "Niche but effective";
    case "popular_failing":
      return "Popular but failing";
    case "kill":
      return "Kill candidate";
    default:
      return "On the median";
  }
}
