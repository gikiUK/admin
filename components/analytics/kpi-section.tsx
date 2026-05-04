"use client";

import { Activity, Building2, CheckCircle2, ListChecks, ListPlus, TrendingUp, UserPlus, Users } from "lucide-react";
import { KpiCard } from "@/components/analytics/kpi-card";
import { PendingBackend } from "@/components/analytics/pending-backend";
import { useSummary } from "@/lib/analytics/use-summary";

type KpiSectionProps = {
  from: string;
  to: string;
};

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(0)}%`;
}

export function KpiSection({ from, to }: KpiSectionProps) {
  const state = useSummary(from, to);

  if (state.status === "pending-backend") {
    return <PendingBackend endpoint="GET /admin/analytics/summary" />;
  }
  if (state.status === "error") {
    return <div className="text-sm text-destructive">{state.message}</div>;
  }

  const data = state.status === "ready" ? state.data : null;
  const isLoading = state.status === "loading";

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        label="DAU"
        icon={Activity}
        value={data ? data.active_users.dau : isLoading ? "…" : null}
        hint="Distinct users with any event today"
      />
      <KpiCard
        label="WAU"
        icon={Activity}
        value={data ? data.active_users.wau : isLoading ? "…" : null}
        hint="Weekly active (proxy via event log)"
      />
      <KpiCard
        label="MAU"
        icon={Activity}
        value={data ? data.active_users.mau : isLoading ? "…" : null}
        hint="Monthly active (proxy via event log)"
      />
      <KpiCard
        label="Active orgs"
        icon={Building2}
        value={data ? data.active_orgs : isLoading ? "…" : null}
        hint="Distinct companies with any event in range"
      />
      <KpiCard label="New signups" icon={UserPlus} value={data ? data.new_signups : isLoading ? "…" : null} />
      <KpiCard label="New companies" icon={Users} value={data ? data.new_companies : isLoading ? "…" : null} />
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
