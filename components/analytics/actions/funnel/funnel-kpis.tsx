"use client";

import { KpiCard } from "@/components/analytics/actions/funnel/kpi-card";
import type { ActionFunnel } from "@/lib/analytics/actions-api";

type Props = {
  kpis: ActionFunnel["kpis"];
};

export function FunnelKpis({ kpis }: Props) {
  const median = kpis.median_time_to_complete_days;
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      <KpiCard label="Created" value={kpis.created.toLocaleString()} />
      <KpiCard label="Reached in progress" value={kpis.reached_in_progress.toLocaleString()} />
      <KpiCard label="Completed" value={kpis.completed.toLocaleString()} />
      <KpiCard label="Completion rate" value={`${(kpis.completion_rate * 100).toFixed(1)}%`} />
      <KpiCard label="Median time to complete" value={median !== null ? `${median.toFixed(1)}d` : "—"} />
    </div>
  );
}
