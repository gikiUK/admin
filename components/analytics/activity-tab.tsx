"use client";

import { useCallback } from "react";
import { AtRiskOrgs } from "@/components/analytics/at-risk-orgs";
import { EmailHealth } from "@/components/analytics/email-health";
import type { ChartMode } from "@/components/analytics/events-time-series";
import { EventsTimeSeries } from "@/components/analytics/events-time-series";
import { InvitationsFunnel } from "@/components/analytics/invitations-funnel";
import { StatusDistribution } from "@/components/analytics/status-distribution";
import { TopActionTypes } from "@/components/analytics/top-action-types";
import { TopCompletedActions } from "@/components/analytics/top-completed-actions";
import type { AnalyticsSummary } from "@/lib/analytics/api";
import { parseSelection, type SeriesId, serializeSelection } from "@/lib/analytics/event-series";
import { useUrlState } from "@/lib/use-url-state";

type ActivityTabProps = {
  data: AnalyticsSummary;
};

function isChartMode(value: string | null): value is ChartMode {
  return value === "line" || value === "stacked";
}

export function ActivityTab({ data }: ActivityTabProps) {
  const { searchParams, set } = useUrlState();
  const selected = parseSelection(searchParams.get("series"));
  const rawMode = searchParams.get("chart");
  const mode: ChartMode = isChartMode(rawMode) ? rawMode : "line";

  const handleSelectedChange = useCallback(
    (next: SeriesId[]) => {
      set({ series: serializeSelection(next) });
    },
    [set]
  );

  const handleModeChange = useCallback(
    (next: ChartMode) => {
      set({ chart: next === "line" ? undefined : next });
    },
    [set]
  );

  const rawSeries = data.events_over_time_by_type ?? [];

  return (
    <div className="space-y-4">
      <EventsTimeSeries
        data={rawSeries}
        selected={selected}
        mode={mode}
        onSelectedChange={handleSelectedChange}
        onModeChange={handleModeChange}
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <StatusDistribution distribution={data.status_distribution} />
        <AtRiskOrgs orgs={data.at_risk_orgs} />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TopActionTypes items={data.top_action_types ?? []} />
        <TopCompletedActions items={data.top_completed_action_types} />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <InvitationsFunnel funnel={data.invitations_funnel} />
        <EmailHealth health={data.email_health} />
      </div>
    </div>
  );
}
