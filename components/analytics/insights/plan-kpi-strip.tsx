"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { PlanBreakdownResponse } from "@/lib/analytics/insights/insights-api";

type Props = {
  data: PlanBreakdownResponse;
};

export function PlanKpiStrip({ data }: Props) {
  const { kpis } = data;
  const completion = completionRate(kpis.actions_by_status, kpis.total_actions);

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <HeroKpi
        label="Total plan actions"
        value={kpis.total_actions.toLocaleString()}
        sub={`across ${data.cohort_size.toLocaleString()} orgs · ${kpis.avg_actions_per_org.toFixed(1)} avg/org`}
      />
      <div className="grid grid-cols-2 gap-3 md:col-span-2">
        <Kpi label="Cohort size" value={data.cohort_size.toLocaleString()} />
        <Kpi label="Avg actions / org" value={kpis.avg_actions_per_org.toFixed(1)} />
        <Kpi
          label="Total recommendations"
          value={kpis.total_recommendations === null ? "—" : kpis.total_recommendations.toLocaleString()}
          sub={kpis.total_recommendations === null ? "cohort > 1000 (skipped)" : undefined}
        />
        <Kpi label="Completion rate" value={`${completion.toFixed(1)}%`} />
      </div>
    </div>
  );
}

function HeroKpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="py-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-primary">{label}</div>
        <div className="mt-1 text-4xl font-bold tracking-tight tabular-nums">{value}</div>
        {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
      </CardContent>
    </Card>
  );
}

function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardContent className="py-3">
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="mt-0.5 text-xl font-semibold tracking-tight tabular-nums">{value}</div>
        {sub && <div className="text-[11px] text-muted-foreground">{sub}</div>}
      </CardContent>
    </Card>
  );
}

function completionRate(byStatus: Record<string, number>, total: number): number {
  if (total === 0) return 0;
  return ((byStatus.completed ?? 0) / total) * 100;
}
