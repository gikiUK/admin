"use client";

import { HeroKpiCard } from "@/components/analytics/insights/shared/hero-kpi-card";
import { KpiCard } from "@/components/analytics/insights/shared/kpi-card";
import type { CohortSummary } from "@/lib/analytics/insights/insights-api";

type Props = {
  data: CohortSummary;
};

function shareOf(count: number, total: number) {
  return total === 0 ? 0 : (count / total) * 100;
}

export function InsightsKpiStrip({ data }: Props) {
  const cohortShare = shareOf(data.cohort_size, data.total_orgs_in_db);

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <HeroKpiCard
        label="Cohort size"
        value={data.cohort_size.toLocaleString()}
        sub={`${cohortShare.toFixed(1)}% of all orgs · ${data.total_orgs_in_db.toLocaleString()} total`}
      />
      <div className="grid grid-cols-2 gap-3 md:col-span-2">
        <KpiCard
          label="Premium / standard"
          value={`${data.tier_breakdown.premium} / ${data.tier_breakdown.standard}`}
        />
        <KpiCard
          label="With any tracked actions"
          value={data.with_any_actions.toLocaleString()}
          sub={`${shareOf(data.with_any_actions, data.cohort_size).toFixed(1)}%`}
        />
        <KpiCard
          label="With completed actions"
          value={data.with_completed_actions.toLocaleString()}
          sub={`${shareOf(data.with_completed_actions, data.cohort_size).toFixed(1)}%`}
        />
        <KpiCard
          label="Avg actions per org"
          value={data.tracked_actions.avg_per_org.toFixed(1)}
          sub={`median ${data.tracked_actions.median_per_org}`}
        />
      </div>
    </div>
  );
}
