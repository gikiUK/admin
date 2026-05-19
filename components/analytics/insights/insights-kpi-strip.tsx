"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { CohortSummary } from "@/lib/analytics/insights/insights-api";

type Props = {
  data: CohortSummary;
};

export function InsightsKpiStrip({ data }: Props) {
  const cohortShare = data.total_orgs_in_db === 0 ? 0 : (data.cohort_size / data.total_orgs_in_db) * 100;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      <Kpi
        label="Cohort size"
        value={data.cohort_size.toLocaleString()}
        sub={`${cohortShare.toFixed(1)}% of all orgs`}
      />
      <Kpi label="Premium / standard" value={`${data.tier_breakdown.premium} / ${data.tier_breakdown.standard}`} />
      <Kpi
        label="With any tracked actions"
        value={data.with_any_actions.toLocaleString()}
        sub={`${shareOf(data.with_any_actions, data.cohort_size).toFixed(1)}%`}
      />
      <Kpi
        label="With completed actions"
        value={data.with_completed_actions.toLocaleString()}
        sub={`${shareOf(data.with_completed_actions, data.cohort_size).toFixed(1)}%`}
      />
      <Kpi
        label="Avg actions per org"
        value={data.tracked_actions.avg_per_org.toFixed(1)}
        sub={`median ${data.tracked_actions.median_per_org}`}
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

function shareOf(count: number, total: number) {
  return total === 0 ? 0 : (count / total) * 100;
}
