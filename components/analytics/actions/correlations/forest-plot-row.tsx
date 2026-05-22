"use client";

import { ForestDot } from "@/components/analytics/actions/correlations/forest-dot";
import { ForestErrorBar } from "@/components/analytics/actions/correlations/forest-error-bar";
import { liftColor } from "@/components/analytics/actions/correlations/forest-plot-helpers";
import type { ActionCorrelationFactor } from "@/lib/analytics/actions-api";

type Props = {
  factor: ActionCorrelationFactor;
  y: number;
  plotLeft: number;
  plotRight: number;
  rightStrip: number;
  xScale: (value: number) => number;
  dotRadius: (n: number) => number;
};

export function ForestPlotRow({ factor, y, plotLeft, plotRight, rightStrip, xScale, dotRadius }: Props) {
  const isInsufficient = factor.insufficient_data || factor.lift === null;
  const lift = factor.lift ?? 0;
  const ciLow = factor.ci_low ?? lift;
  const ciHigh = factor.ci_high ?? lift;
  const color = liftColor(lift, isInsufficient);
  const radius = dotRadius(Math.min(factor.with.n, factor.without.n));

  return (
    <g>
      <text x={8} y={y} dy="0.32em" fontSize={12} fill="var(--foreground)">
        {factor.label}
      </text>
      {isInsufficient ? (
        <text
          x={(plotLeft + plotRight) / 2}
          y={y}
          dy="0.32em"
          textAnchor="middle"
          fontSize={11}
          fill="var(--muted-foreground)"
        >
          Not enough data
        </text>
      ) : (
        <>
          <ForestErrorBar y={y} xLower={xScale(ciLow)} xUpper={xScale(ciHigh)} color={color} />
          <ForestDot
            factor={factor}
            y={y}
            cx={xScale(lift)}
            radius={radius}
            color={color}
            lift={lift}
            ciLow={ciLow}
            ciHigh={ciHigh}
          />
        </>
      )}
      <text x={rightStrip} y={y} dy="0.32em" fontSize={11} fill="var(--muted-foreground)" textAnchor="end">
        {factor.with.n} / {factor.without.n}
      </text>
    </g>
  );
}
