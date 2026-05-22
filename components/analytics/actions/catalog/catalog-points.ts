import type { Quadrant, QuadrantPoint } from "@/components/analytics/actions/catalog/catalog-types";
import type { ActionLeaderboardRow } from "@/lib/analytics/actions-api";

type Result = {
  points: QuadrantPoint[];
  xMedian: number;
  yMedian: number;
  useLogScale: boolean;
};

function median(values: number[]) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function classify(row: ActionLeaderboardRow, xMed: number, yMed: number): Quadrant {
  if (row.adoption_count === xMed || row.completion_rate === yMed) return "boundary";
  const aboveX = row.adoption_count > xMed;
  const aboveY = row.completion_rate > yMed;
  if (aboveX && aboveY) return "star";
  if (!aboveX && aboveY) return "niche";
  if (aboveX && !aboveY) return "popular_failing";
  return "kill";
}

export function buildCatalogPoints(rows: ActionLeaderboardRow[], minAdoption: number): Result {
  const filtered = rows.filter((r) => r.adoption_count >= minAdoption);
  if (filtered.length === 0) return { points: [], xMedian: 0, yMedian: 0, useLogScale: false };

  const xValues = filtered.map((r) => r.adoption_count);
  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  const useLogScale = xMin > 0 && xMax / xMin >= 4;

  const xMed = median(xValues);
  const yMed = median(filtered.map((r) => r.completion_rate));

  const points: QuadrantPoint[] = filtered.map((r) => ({
    id: `${r.action_type}:${r.action_id}`,
    x: r.adoption_count,
    y: r.completion_rate * 100,
    size: r.adoption_count,
    title: r.title ?? `#${r.action_id}`,
    adoption_count: r.adoption_count,
    completion_count: r.completion_count,
    completion_rate: r.completion_rate,
    quadrant: classify(r, xMed, yMed)
  }));

  return { points, xMedian: xMed, yMedian: yMed * 100, useLogScale };
}
