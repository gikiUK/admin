"use client";

import { formatPct } from "@/components/analytics/actions/shared/format";
import { MetricRow, TooltipCard } from "@/components/analytics/actions/shared/tooltip-card";
import type { ActionLeaderboardRow } from "@/lib/analytics/actions-api";

type Props = {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: unknown }>;
};

export function LeaderboardTooltip({ active, payload }: Props) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload as ActionLeaderboardRow;
  return (
    <TooltipCard title={row.title ?? `#${row.action_id}`}>
      <MetricRow label="Adoption" value={row.adoption_count} />
      <MetricRow label="Completed" value={row.completion_count} />
      <MetricRow label="Completion" value={formatPct(row.completion_rate)} />
      <MetricRow label="Stale" value={row.stale_count} />
      {row.median_time_to_complete_days !== null && (
        <MetricRow label="Median TTC" value={`${row.median_time_to_complete_days.toFixed(1)}d`} />
      )}
    </TooltipCard>
  );
}
