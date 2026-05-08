"use client";

import { useCallback, useMemo } from "react";
import { AtRiskOrgs } from "@/components/analytics/at-risk-orgs";
import { DEFAULT_PRESET, isPreset, presetToRange, previousRange } from "@/components/analytics/date-range-picker";
import { EmailHealth } from "@/components/analytics/email-health";
import type { ChartMode } from "@/components/analytics/events-time-series";
import { EventsTimeSeries } from "@/components/analytics/events-time-series";
import { InvitationsFunnel } from "@/components/analytics/invitations-funnel";
import { StatusDistribution } from "@/components/analytics/status-distribution";
import { TopActionTypes } from "@/components/analytics/top-action-types";
import { TopCompletedActions } from "@/components/analytics/top-completed-actions";
import type { AnalyticsSummary } from "@/lib/analytics/api";
import { parseSelection, type SeriesId, serializeSelection } from "@/lib/analytics/event-series";
import { usePreviousSeries } from "@/lib/analytics/use-previous-series";
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
  const smooth = searchParams.get("smooth") === "1";
  const compare = searchParams.get("compare") === "1";

  const rawPreset = searchParams.get("range");
  const preset = isPreset(rawPreset) ? rawPreset : DEFAULT_PRESET;
  const { from, to } = useMemo(() => presetToRange(preset), [preset]);
  const prior = useMemo(() => previousRange(from, to), [from, to]);

  const previous = usePreviousSeries(prior.from, prior.to, compare);
  const previousData = previous.status === "ready" ? previous.data : null;

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

  const handleSmoothChange = useCallback(
    (next: boolean) => {
      set({ smooth: next ? "1" : undefined });
    },
    [set]
  );

  const handleCompareChange = useCallback(
    (next: boolean) => {
      set({ compare: next ? "1" : undefined });
    },
    [set]
  );

  const rawSeries = data.events_over_time_by_type ?? [];

  return (
    <div className="space-y-4">
      <EventsTimeSeries
        data={rawSeries}
        previousData={previousData}
        selected={selected}
        mode={mode}
        smooth={smooth}
        compare={compare}
        onSelectedChange={handleSelectedChange}
        onModeChange={handleModeChange}
        onSmoothChange={handleSmoothChange}
        onCompareChange={handleCompareChange}
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
