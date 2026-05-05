"use client";

import { Building2, CheckCircle2, Clock, ListChecks, ListPlus, TrendingUp, Users } from "lucide-react";
import { KpiCard } from "@/components/analytics/kpi-card";
import type { AnalyticsSummary } from "@/lib/analytics/api";

type OrgKpisProps = {
  data: AnalyticsSummary | null;
  isLoading: boolean;
};

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(0)}%`;
}

export function OrgKpis({ data, isLoading }: OrgKpisProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        label="Active orgs"
        icon={Building2}
        value={data ? data.active_orgs : isLoading ? "…" : null}
        hint="Distinct companies with any event in range"
      />
      <KpiCard label="New companies" icon={Users} value={data ? data.new_companies : isLoading ? "…" : null} />
      <KpiCard
        label="Trial orgs"
        icon={Clock}
        value={data ? data.trial_orgs : isLoading ? "…" : null}
        hint="Companies currently in trial"
      />
      <KpiCard
        label="Actions added"
        icon={ListPlus}
        value={data ? data.tracked_actions_added : isLoading ? "…" : null}
      />
      <KpiCard
        label="Actions completed"
        icon={CheckCircle2}
        value={data ? data.tracked_actions_completed : isLoading ? "…" : null}
      />
      <KpiCard
        label="Avg. completion rate"
        icon={TrendingUp}
        value={data ? formatPercent(data.avg_completion_rate) : isLoading ? "…" : null}
        hint="Mean of completed ÷ total actions per company"
      />
      <KpiCard
        label="Status mix"
        icon={ListChecks}
        value={data ? Object.keys(data.status_distribution).length : isLoading ? "…" : null}
        hint="Distinct action statuses (see breakdown)"
      />
    </div>
  );
}
