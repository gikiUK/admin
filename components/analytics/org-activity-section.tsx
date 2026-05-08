"use client";

import { useCallback, useMemo } from "react";
import { ActivityChart, type ChartClickPayload, type ChartMode } from "@/components/analytics/activity-chart";
import {
  DateRangePicker,
  type DateRangePreset,
  DEFAULT_PRESET,
  isPreset,
  presetToRange,
  previousRange
} from "@/components/analytics/date-range-picker";
import { parseSelection, type SeriesId, serializeSelection } from "@/lib/analytics/event-series";
import { useOrgActivity, useOrgPreviousActivity } from "@/lib/analytics/use-org-activity";
import { useUrlState } from "@/lib/use-url-state";

type Props = {
  slug: string;
  companyId: number;
  companyName: string;
};

function isChartMode(value: string | null): value is ChartMode {
  return value === "line" || value === "stacked";
}

export function OrgActivitySection({ slug, companyId, companyName }: Props) {
  const { searchParams, set } = useUrlState();

  const rawPreset = searchParams.get("activity_range");
  const preset: DateRangePreset = isPreset(rawPreset) ? rawPreset : DEFAULT_PRESET;
  const { from, to } = useMemo(() => presetToRange(preset), [preset]);
  const prior = useMemo(() => previousRange(from, to), [from, to]);

  const selected = parseSelection(searchParams.get("series"));
  const rawMode = searchParams.get("chart");
  const mode: ChartMode = isChartMode(rawMode) ? rawMode : "line";
  const smooth = searchParams.get("smooth") === "1";
  const compare = searchParams.get("compare") === "1";

  const activity = useOrgActivity(slug, from, to);
  const previous = useOrgPreviousActivity(slug, prior.from, prior.to, compare);

  const data = activity.status === "ready" ? activity.data : [];
  const previousData = previous?.status === "ready" ? previous.data : null;

  const handlePresetChange = useCallback((next: DateRangePreset) => set({ activity_range: next }), [set]);
  const handleSelectedChange = useCallback((next: SeriesId[]) => set({ series: serializeSelection(next) }), [set]);
  const handleModeChange = useCallback((next: ChartMode) => set({ chart: next === "line" ? undefined : next }), [set]);
  const handleSmoothChange = useCallback((next: boolean) => set({ smooth: next ? "1" : undefined }), [set]);
  const handleCompareChange = useCallback((next: boolean) => set({ compare: next ? "1" : undefined }), [set]);

  const handlePointClick = useCallback(
    ({ date }: ChartClickPayload) => {
      const dayStart = new Date(`${date}T00:00:00.000Z`);
      if (Number.isNaN(dayStart.getTime())) return;
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      set({
        tab: "events",
        from: dayStart.toISOString(),
        to: dayEnd.toISOString(),
        company_id: String(companyId),
        company_label: companyName,
        page: undefined,
        event: undefined
      });
    },
    [set, companyId, companyName]
  );

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <DateRangePicker value={preset} onChange={handlePresetChange} />
      </div>
      {activity.status === "loading" && <div className="text-sm text-muted-foreground">Loading activity…</div>}
      {activity.status === "error" && <div className="text-sm text-destructive">{activity.message}</div>}
      {activity.status === "pending-backend" && (
        <div className="text-sm text-muted-foreground">
          Activity endpoint is not deployed yet (GET /admin/analytics/organizations/:slug/activity).
        </div>
      )}
      {activity.status === "ready" && (
        <ActivityChart
          title={`Activity of ${companyName}`}
          data={data}
          previousData={previousData}
          selected={selected}
          mode={mode}
          smooth={smooth}
          compare={compare}
          onSelectedChange={handleSelectedChange}
          onModeChange={handleModeChange}
          onSmoothChange={handleSmoothChange}
          onCompareChange={handleCompareChange}
          onPointClick={handlePointClick}
        />
      )}
    </div>
  );
}
