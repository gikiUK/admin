"use client";

import { AtRiskOrgs } from "@/components/analytics/at-risk-orgs";
import { PendingBackend } from "@/components/analytics/pending-backend";
import { StatusDistribution } from "@/components/analytics/status-distribution";
import { TopCompletedActions } from "@/components/analytics/top-completed-actions";
import { useSummary } from "@/lib/analytics/use-summary";

type BreakdownsSectionProps = {
  from: string;
  to: string;
};

export function BreakdownsSection({ from, to }: BreakdownsSectionProps) {
  const state = useSummary(from, to);

  if (state.status === "pending-backend") {
    return <PendingBackend endpoint="GET /admin/analytics/summary" />;
  }
  if (state.status === "error") {
    return <div className="text-sm text-destructive">{state.message}</div>;
  }
  if (state.status === "loading") {
    return <div className="text-sm text-muted-foreground">Loading breakdowns…</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <StatusDistribution distribution={state.data.status_distribution} />
      <TopCompletedActions items={state.data.top_completed_action_types} />
      <div className="lg:col-span-2">
        <AtRiskOrgs orgs={state.data.at_risk_orgs} />
      </div>
    </div>
  );
}
