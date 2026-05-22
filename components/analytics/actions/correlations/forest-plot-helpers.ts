import type { ActionCorrelationFactor } from "@/lib/analytics/actions-api";

export const FOREST_TICKS = [-0.5, -0.25, 0, 0.25, 0.5];

export const FOREST_LAYOUT = {
  rowHeight: 32,
  topPadding: 28,
  bottomPadding: 28,
  labelWidth: 180,
  plotRightPadding: 8,
  rightStripReserve: 100,
  minDotRadius: 3,
  maxDotRadius: 7,
  width: 720
} as const;

export type ForestScales = {
  width: number;
  plotLeft: number;
  plotRight: number;
  rightStrip: number;
  domainMin: number;
  domainMax: number;
  maxN: number;
  xScale: (value: number) => number;
  dotRadius: (n: number) => number;
};

export function buildForestScales(factors: ActionCorrelationFactor[]): ForestScales {
  const { width, labelWidth, plotRightPadding, rightStripReserve, minDotRadius, maxDotRadius } = FOREST_LAYOUT;
  const plotLeft = labelWidth;
  const plotRight = width - plotRightPadding - rightStripReserve;
  const rightStrip = width - plotRightPadding;

  const usable = factors.filter((f) => !f.insufficient_data && f.lift !== null);
  let domainMin = -0.5;
  let domainMax = 0.5;
  if (usable.length > 0) {
    const bounds = usable.flatMap((f) => {
      const lift = f.lift ?? 0;
      return [f.ci_low ?? lift, f.ci_high ?? lift];
    });
    const min = Math.min(...bounds, -0.1);
    const max = Math.max(...bounds, 0.1);
    const pad = Math.max((max - min) * 0.08, 0.02);
    domainMin = Math.max(min - pad, -1);
    domainMax = Math.min(max + pad, 1);
  }

  const ns = factors.flatMap((f) => [f.with.n, f.without.n]);
  const maxN = ns.length > 0 ? Math.max(...ns, 1) : 1;

  const xScale = (value: number) => {
    const span = domainMax - domainMin;
    const t = span > 0 ? (value - domainMin) / span : 0.5;
    return plotLeft + t * (plotRight - plotLeft);
  };

  const dotRadius = (n: number) => {
    const t = Math.sqrt(n / maxN);
    return minDotRadius + t * (maxDotRadius - minDotRadius);
  };

  return { width, plotLeft, plotRight, rightStrip, domainMin, domainMax, maxN, xScale, dotRadius };
}

export function liftColor(lift: number, insufficient: boolean): string {
  if (insufficient) return "var(--muted-foreground)";
  if (lift > 0) return "hsl(140, 60%, 40%)";
  if (lift < 0) return "hsl(0, 65%, 55%)";
  return "var(--muted-foreground)";
}
