import type { ChartPoint } from "@/lib/analytics/event-series";

export function formatTick(value: string): string {
  const date = new Date(value);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function trimLeadingZeros(points: ChartPoint[], keys: string[]): ChartPoint[] {
  const firstNonZero = points.findIndex((point) => keys.some((key) => Number(point[key] ?? 0) > 0));
  return firstNonZero === -1 ? points : points.slice(firstNonZero);
}
