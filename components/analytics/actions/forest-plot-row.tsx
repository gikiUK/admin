"use client";

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

export function formatPct(value: number | null): string {
  if (value === null) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${(value * 100).toFixed(1)}%`;
}

export function ForestPlotRow({ factor, y, plotLeft, plotRight, rightStrip, xScale, dotRadius }: Props) {
  const isInsufficient = factor.insufficient_data || factor.lift === null;
  const lift = factor.lift ?? 0;
  const lower = factor.ci_low ?? lift;
  const upper = factor.ci_high ?? lift;

  const color = isInsufficient
    ? "var(--muted-foreground)"
    : lift > 0
      ? "hsl(140, 60%, 40%)"
      : lift < 0
        ? "hsl(0, 65%, 55%)"
        : "var(--muted-foreground)";

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
          <line
            x1={xScale(lower)}
            x2={xScale(upper)}
            y1={y}
            y2={y}
            stroke={color}
            strokeOpacity={0.5}
            strokeWidth={2}
          />
          <line
            x1={xScale(lower)}
            x2={xScale(lower)}
            y1={y - 4}
            y2={y + 4}
            stroke={color}
            strokeOpacity={0.5}
            strokeWidth={2}
          />
          <line
            x1={xScale(upper)}
            x2={xScale(upper)}
            y1={y - 4}
            y2={y + 4}
            stroke={color}
            strokeOpacity={0.5}
            strokeWidth={2}
          />
          <circle cx={xScale(lift)} cy={y} r={dotRadius(Math.min(factor.with.n, factor.without.n))} fill={color}>
            <title>
              {`${factor.label}: lift ${formatPct(lift)} (95% CI ${formatPct(lower)} … ${formatPct(upper)})\n` +
                `with: ${factor.with.n} samples, ${(factor.with.completion_rate * 100).toFixed(1)}% completed\n` +
                `without: ${factor.without.n} samples, ${(factor.without.completion_rate * 100).toFixed(1)}% completed`}
            </title>
          </circle>
          <text
            x={xScale(lift)}
            y={y - dotRadius(Math.min(factor.with.n, factor.without.n)) - 4}
            fontSize={10}
            fill="var(--muted-foreground)"
            textAnchor="middle"
          >
            {formatPct(lift)}
          </text>
        </>
      )}

      <text x={rightStrip} y={y} dy="0.32em" fontSize={11} fill="var(--muted-foreground)" textAnchor="end">
        {factor.with.n} / {factor.without.n}
      </text>
    </g>
  );
}
