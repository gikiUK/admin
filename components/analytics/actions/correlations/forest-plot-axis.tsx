"use client";

import { FOREST_TICKS } from "@/components/analytics/actions/correlations/forest-plot-helpers";
import { formatSignedPct } from "@/components/analytics/actions/shared/format";

type Props = {
  plotLeft: number;
  plotRight: number;
  rightStrip: number;
  topPadding: number;
  bottomPadding: number;
  height: number;
  domainMin: number;
  domainMax: number;
  xScale: (value: number) => number;
};

export function ForestPlotAxis({
  plotLeft,
  plotRight,
  rightStrip,
  topPadding,
  bottomPadding,
  height,
  domainMin,
  domainMax,
  xScale
}: Props) {
  return (
    <>
      <text x={8} y={16} fontSize={11} fill="var(--muted-foreground)">
        Factor
      </text>
      <text x={(plotLeft + plotRight) / 2} y={16} fontSize={11} fill="var(--muted-foreground)" textAnchor="middle">
        Completion rate lift (with − without)
      </text>
      <text x={rightStrip} y={16} fontSize={11} fill="var(--muted-foreground)" textAnchor="end">
        with / without
      </text>
      {FOREST_TICKS.filter((t) => t >= domainMin && t <= domainMax).map((tick) => (
        <g key={tick}>
          <line
            x1={xScale(tick)}
            x2={xScale(tick)}
            y1={topPadding}
            y2={height - bottomPadding + 4}
            stroke={tick === 0 ? "var(--muted-foreground)" : "var(--border)"}
            strokeOpacity={tick === 0 ? 0.5 : 0.4}
            strokeDasharray={tick === 0 ? undefined : "2 3"}
          />
          <text
            x={xScale(tick)}
            y={height - bottomPadding + 18}
            fontSize={10}
            fill="var(--muted-foreground)"
            textAnchor="middle"
          >
            {formatSignedPct(tick)}
          </text>
        </g>
      ))}
    </>
  );
}
