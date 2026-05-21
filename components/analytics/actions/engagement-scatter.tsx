"use client";

import { useMemo, useState } from "react";
import { CartesianGrid, ReferenceLine, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { ActionLeaderboardRow } from "@/lib/analytics/actions-api";

type Props = {
  rows: ActionLeaderboardRow[];
  minTracked?: number;
};

type Axis = "assignee_coverage" | "due_date_coverage" | "notes_coverage";

const AXIS_LABELS: Record<Axis, string> = {
  assignee_coverage: "Assignee coverage",
  due_date_coverage: "Due-date coverage",
  notes_coverage: "Notes coverage"
};

type Point = {
  x: number;
  y: number;
  size: number;
  title: string;
  adoption_count: number;
  completion_count: number;
  coverage: number;
  completion_rate: number;
  action_id: number;
  action_type: string;
};

export function EngagementScatter({ rows, minTracked = 5 }: Props) {
  const [axis, setAxis] = useState<Axis>("assignee_coverage");

  const points: Point[] = useMemo(() => {
    return rows
      .filter((r) => r.tracked_total >= minTracked)
      .map((r) => ({
        x: r[axis] * 100,
        y: r.completion_rate * 100,
        size: r.adoption_count,
        title: r.title ?? `#${r.action_id}`,
        adoption_count: r.adoption_count,
        completion_count: r.completion_count,
        coverage: r[axis],
        completion_rate: r.completion_rate,
        action_id: r.action_id,
        action_type: r.action_type
      }));
  }, [rows, axis, minTracked]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle className="text-base">Engagement quality</CardTitle>
          <p className="text-xs text-muted-foreground">
            Each dot is an action with ≥{minTracked} tracked instances. Dot area scales with adoption count. Hunt for
            outliers — actions far above or below the diagonal are worth a closer look.
          </p>
        </div>
        <ToggleGroup
          type="single"
          value={axis}
          onValueChange={(value) => value && setAxis(value as Axis)}
          variant="outline"
          size="sm"
        >
          <ToggleGroupItem value="assignee_coverage">Assignee</ToggleGroupItem>
          <ToggleGroupItem value="due_date_coverage">Due date</ToggleGroupItem>
          <ToggleGroupItem value="notes_coverage">Notes</ToggleGroupItem>
        </ToggleGroup>
      </CardHeader>
      <CardContent>
        {points.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No actions with ≥{minTracked} tracked instances in this range.
          </div>
        ) : (
          <div style={{ height: 340 }}>
            <ScatterChart
              width={720}
              height={340}
              margin={{ top: 16, right: 24, bottom: 36, left: 36 }}
              style={{ width: "100%" }}
            >
              <CartesianGrid stroke="var(--border)" strokeOpacity={0.5} />
              <XAxis
                type="number"
                dataKey="x"
                name={AXIS_LABELS[axis]}
                domain={[0, 100]}
                tickCount={6}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                label={{
                  value: `${AXIS_LABELS[axis]} (%)`,
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
                tickCount={6}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                label={{
                  value: "Completion rate (%)",
                  angle: -90,
                  position: "insideLeft",
                  offset: 8,
                  style: { fontSize: 11, fill: "var(--muted-foreground)" }
                }}
              />
              <ZAxis type="number" dataKey="size" range={[30, 400]} />
              <ReferenceLine
                segment={[
                  { x: 0, y: 0 },
                  { x: 100, y: 100 }
                ]}
                stroke="var(--muted-foreground)"
                strokeDasharray="3 3"
                strokeOpacity={0.4}
              />
              <Tooltip
                cursor={{ strokeDasharray: "3 3", stroke: "var(--border)" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const point = payload[0].payload as Point;
                  return (
                    <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
                      <div className="font-medium">{point.title}</div>
                      <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 text-muted-foreground">
                        <span>{AXIS_LABELS[axis]}</span>
                        <span className="text-right text-foreground">{(point.coverage * 100).toFixed(1)}%</span>
                        <span>Completion</span>
                        <span className="text-right text-foreground">{(point.completion_rate * 100).toFixed(1)}%</span>
                        <span>Adoption</span>
                        <span className="text-right text-foreground">{point.adoption_count}</span>
                        <span>Completed</span>
                        <span className="text-right text-foreground">{point.completion_count}</span>
                      </div>
                    </div>
                  );
                }}
              />
              <Scatter data={points} fill="var(--primary)" fillOpacity={0.6} />
            </ScatterChart>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
