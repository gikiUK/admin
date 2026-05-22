"use client";

import { HeroKpiCard } from "@/components/analytics/insights/shared/hero-kpi-card";
import { KpiCard } from "@/components/analytics/insights/shared/kpi-card";
import type { PlanBreakdownResponse } from "@/lib/analytics/insights/insights-api";

type Props = {
  data: PlanBreakdownResponse;
};

function completionRate(byStatus: Record<string, number>, total: number): number {
  if (total === 0) return 0;
  return ((byStatus.completed ?? 0) / total) * 100;
}

export function PlanKpiStrip({ data }: Props) {
  const { kpis } = data;
  const completion = completionRate(kpis.actions_by_status, kpis.total_actions);

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <HeroKpiCard
        label="Total plan actions"
        value={kpis.total_actions.toLocaleString()}
        sub={`across ${data.cohort_size.toLocaleString()} orgs · ${kpis.avg_actions_per_org.toFixed(1)} avg/org`}
      />
      <div className="grid grid-cols-2 gap-3 md:col-span-2">
        <KpiCard label="Cohort size" value={data.cohort_size.toLocaleString()} />
        <KpiCard label="Avg actions / org" value={kpis.avg_actions_per_org.toFixed(1)} />
        <KpiCard
          label="Total recommendations"
          value={kpis.total_recommendations === null ? "—" : kpis.total_recommendations.toLocaleString()}
          sub={kpis.total_recommendations === null ? "cohort > 1000 (skipped)" : undefined}
        />
        <KpiCard label="Completion rate" value={`${completion.toFixed(1)}%`} />
      </div>
    </div>
  );
}
