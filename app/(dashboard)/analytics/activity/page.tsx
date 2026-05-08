"use client";

import { ActivityTab } from "@/components/analytics/activity-tab";
import { DateRangePicker, DEFAULT_PRESET, isPreset } from "@/components/analytics/date-range-picker";
import { SummaryGate } from "@/components/analytics/summary-gate";
import { PageHeader } from "@/components/page-header";
import { useUrlState } from "@/lib/use-url-state";

export default function AnalyticsActivityPage() {
  const { searchParams, set } = useUrlState();
  const rawPreset = searchParams.get("range");
  const preset = isPreset(rawPreset) ? rawPreset : DEFAULT_PRESET;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity"
        description="Trends across all events"
        action={<DateRangePicker value={preset} onChange={(next) => set({ range: next })} />}
      />
      <SummaryGate loadingLabel="Loading activity…">{(data) => <ActivityTab data={data} />}</SummaryGate>
    </div>
  );
}
