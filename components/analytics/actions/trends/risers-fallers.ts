import type { ActionTrendRow } from "@/lib/analytics/actions-api";

export function splitRisersFallers(rows: ActionTrendRow[], topN: number) {
  const sorted = [...rows].sort((a, b) => b.slope - a.slope);
  const risers = sorted.filter((r) => r.slope > 0).slice(0, topN);
  const fallers = sorted
    .filter((r) => r.slope < 0)
    .slice(-topN)
    .reverse();
  return { risers, fallers };
}
