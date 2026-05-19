"use client";

import { useMemo } from "react";
import type { ActionCorrelationFactor } from "@/lib/analytics/actions-api";

type Props = {
  factors: ActionCorrelationFactor[];
};

const ROW_HEIGHT = 32;
const TOP_PADDING = 28;
const BOTTOM_PADDING = 28;
const LABEL_WIDTH = 180;
const PLOT_RIGHT_PADDING = 8;
const MIN_DOT_RADIUS = 3;
const MAX_DOT_RADIUS = 7;

const TICKS = [-0.5, -0.25, 0, 0.25, 0.5];

function formatPct(value: number | null): string {
  if (value === null) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${(value * 100).toFixed(1)}%`;
}

export function ForestPlot({ factors }: Props) {
  const width = 720;
  const plotLeft = LABEL_WIDTH;
  const plotRight = width - PLOT_RIGHT_PADDING - 100; // reserve right strip for the with/without text
  const rightStrip = width - PLOT_RIGHT_PADDING;

  // Domain bounded by data, padded — but clamped to a sensible window so a giant CI doesn't squash everything.
  const { domainMin, domainMax } = useMemo(() => {
    const usable = factors.filter((f) => !f.insufficient_data && f.lift !== null);
    if (usable.length === 0) return { domainMin: -0.5, domainMax: 0.5 };

    const bounds = usable.flatMap((f) => {
      const lift = f.lift ?? 0;
      return [f.ci_low ?? lift, f.ci_high ?? lift];
    });
    const min = Math.min(...bounds, -0.1);
    const max = Math.max(...bounds, 0.1);
    const pad = Math.max((max - min) * 0.08, 0.02);
    return { domainMin: Math.max(min - pad, -1), domainMax: Math.min(max + pad, 1) };
  }, [factors]);

  const maxN = useMemo(() => {
    const ns = factors.flatMap((f) => [f.with.n, f.without.n]);
    return ns.length > 0 ? Math.max(...ns, 1) : 1;
  }, [factors]);

  const height = TOP_PADDING + BOTTOM_PADDING + factors.length * ROW_HEIGHT;

  const xScale = (value: number) => {
    const t = (value - domainMin) / (domainMax - domainMin);
    return plotLeft + t * (plotRight - plotLeft);
  };

  const dotRadius = (n: number) => {
    const t = Math.sqrt(n / maxN);
    return MIN_DOT_RADIUS + t * (MAX_DOT_RADIUS - MIN_DOT_RADIUS);
  };

  if (factors.length === 0) {
    return <div className="text-sm text-muted-foreground">No factors to compare.</div>;
  }

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMinYMid meet"
        className="w-full"
        style={{ height, minWidth: 600 }}
        role="img"
        aria-label="Forest plot of factor lifts on action completion rate"
      >
        <title>Forest plot of factor lifts on action completion rate</title>

        {/* Header */}
        <text x={8} y={16} fontSize={11} fill="var(--muted-foreground)">
          Factor
        </text>
        <text x={(plotLeft + plotRight) / 2} y={16} fontSize={11} fill="var(--muted-foreground)" textAnchor="middle">
          Completion rate lift (with − without)
        </text>
        <text x={rightStrip} y={16} fontSize={11} fill="var(--muted-foreground)" textAnchor="end">
          with / without
        </text>

        {/* Axis ticks + zero line */}
        {TICKS.filter((t) => t >= domainMin && t <= domainMax).map((tick) => (
          <g key={tick}>
            <line
              x1={xScale(tick)}
              x2={xScale(tick)}
              y1={TOP_PADDING}
              y2={height - BOTTOM_PADDING + 4}
              stroke={tick === 0 ? "var(--muted-foreground)" : "var(--border)"}
              strokeOpacity={tick === 0 ? 0.5 : 0.4}
              strokeDasharray={tick === 0 ? undefined : "2 3"}
            />
            <text
              x={xScale(tick)}
              y={height - BOTTOM_PADDING + 18}
              fontSize={10}
              fill="var(--muted-foreground)"
              textAnchor="middle"
            >
              {formatPct(tick)}
            </text>
          </g>
        ))}

        {/* Rows */}
        {factors.map((factor, i) => {
          const y = TOP_PADDING + ROW_HEIGHT * (i + 0.5);
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
            <g key={factor.factor}>
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
                  <circle
                    cx={xScale(lift)}
                    cy={y}
                    r={dotRadius(Math.min(factor.with.n, factor.without.n))}
                    fill={color}
                  >
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
        })}
      </svg>
    </div>
  );
}
