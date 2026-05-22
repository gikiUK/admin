"use client";

import { formatSignedPct } from "@/components/analytics/actions/shared/format";
import type { ActionCorrelationFactor } from "@/lib/analytics/actions-api";

type Props = {
  factor: ActionCorrelationFactor;
  y: number;
  cx: number;
  radius: number;
  color: string;
  lift: number;
  ciLow: number;
  ciHigh: number;
};

export function ForestDot({ factor, y, cx, radius, color, lift, ciLow, ciHigh }: Props) {
  const withPct = (factor.with.completion_rate * 100).toFixed(1);
  const withoutPct = (factor.without.completion_rate * 100).toFixed(1);
  const tooltip =
    `${factor.label}: lift ${formatSignedPct(lift)} (95% CI ${formatSignedPct(ciLow)} … ${formatSignedPct(ciHigh)})\n` +
    `with: ${factor.with.n} samples, ${withPct}% completed\n` +
    `without: ${factor.without.n} samples, ${withoutPct}% completed`;

  return (
    <>
      <circle cx={cx} cy={y} r={radius} fill={color}>
        <title>{tooltip}</title>
      </circle>
      <text x={cx} y={y - radius - 4} fontSize={10} fill="var(--muted-foreground)" textAnchor="middle">
        {formatSignedPct(lift)}
      </text>
    </>
  );
}
