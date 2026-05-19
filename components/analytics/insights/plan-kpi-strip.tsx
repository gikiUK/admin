"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { PlanBreakdownResponse } from "@/lib/analytics/insights/insights-api";

type Props = {
  data: PlanBreakdownResponse;
};

export function PlanKpiStrip({ data }: Props) {
  const { kpis } = data;
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      <Kpi label="Cohort size" value={data.cohort_size.toLocaleString()} />
      <Kpi label="Total plan actions" value={kpis.total_actions.toLocaleString()} />
      <Kpi label="Avg actions / org" value={kpis.avg_actions_per_org.toFixed(1)} />
      <Kpi
        label="Total recommendations"
        value={kpis.total_recommendations === null ? "—" : kpis.total_recommendations.toLocaleString()}
        sub={kpis.total_recommendations === null ? "cohort > 1000 (skipped)" : undefined}
      />
      <Kpi
        label="Completion rate"
        value={`${completionRate(kpis.actions_by_status, kpis.total_actions).toFixed(1)}%`}
      />
    </div>
  );
}

function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
        {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
      </CardContent>
    </Card>
  );
}

function completionRate(byStatus: Record<string, number>, total: number): number {
  if (total === 0) return 0;
  return ((byStatus.completed ?? 0) / total) * 100;
}
