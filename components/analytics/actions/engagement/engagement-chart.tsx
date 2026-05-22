"use client";

import { CartesianGrid, ReferenceLine, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts";
import { EngagementTooltip } from "@/components/analytics/actions/engagement/engagement-tooltip";
import {
  ENGAGEMENT_AXIS_LABELS,
  type EngagementAxis,
  type EngagementPoint
} from "@/components/analytics/actions/engagement/engagement-types";

type Props = {
  axis: EngagementAxis;
  points: EngagementPoint[];
};

const AXIS_LABEL_STYLE = { fontSize: 11, fill: "var(--muted-foreground)" } as const;

export function EngagementChart({ axis, points }: Props) {
  return (
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
          name={ENGAGEMENT_AXIS_LABELS[axis]}
          domain={[0, 100]}
          tickCount={6}
          tick={AXIS_LABEL_STYLE}
          label={{
            value: `${ENGAGEMENT_AXIS_LABELS[axis]} (%)`,
            position: "insideBottom",
            offset: -16,
            style: AXIS_LABEL_STYLE
          }}
        />
        <YAxis
          type="number"
          dataKey="y"
          name="Completion rate"
          domain={[0, 100]}
          tickCount={6}
          tick={AXIS_LABEL_STYLE}
          label={{
            value: "Completion rate (%)",
            angle: -90,
            position: "insideLeft",
            offset: 8,
            style: AXIS_LABEL_STYLE
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
          content={(props) => <EngagementTooltip {...props} axis={axis} />}
        />
        <Scatter data={points} fill="var(--primary)" fillOpacity={0.6} />
      </ScatterChart>
    </div>
  );
}
