"use client";

import { AtRiskOrgs } from "@/components/analytics/at-risk-orgs";
import { KpiSection } from "@/components/analytics/kpi-section";
import { StatusDistribution } from "@/components/analytics/status-distribution";
import type { AnalyticsSummary } from "@/lib/analytics/api";

type OverviewTabProps = {
  data: AnalyticsSummary | null;
  isLoading: boolean;
};

export function OverviewTab({ data, isLoading }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      <KpiSection data={data} isLoading={isLoading} />
      {data && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <StatusDistribution distribution={data.status_distribution} />
          <AtRiskOrgs orgs={data.at_risk_orgs} />
        </div>
      )}
    </div>
  );
}
