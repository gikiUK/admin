import type { ActionLeaderboardRow } from "@/lib/analytics/actions-api";

export type LeaderboardChartRow = ActionLeaderboardRow & { label: string };

export function disambiguate(rows: ActionLeaderboardRow[]): LeaderboardChartRow[] {
  const seen = new Map<string, number>();
  return rows.map((row) => {
    const base = row.title ?? `#${row.action_id}`;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    const label = count === 0 ? base : `${base} (#${row.action_id})`;
    return { ...row, label };
  });
}
