"use client";

import { useMemo } from "react";
import { BreakdownsSection } from "@/components/analytics/breakdowns-section";
import { DateRangePicker, DEFAULT_PRESET, isPreset, presetToRange } from "@/components/analytics/date-range-picker";
import { EventsExplorer } from "@/components/analytics/events-explorer";
import { KpiSection } from "@/components/analytics/kpi-section";
import { PageHeader } from "@/components/page-header";
import { useUrlState } from "@/lib/use-url-state";

export default function AnalyticsPage() {
  const { searchParams, set } = useUrlState();
  const rawPreset = searchParams.get("range");
  const preset = isPreset(rawPreset) ? rawPreset : DEFAULT_PRESET;
  const { from, to } = useMemo(() => presetToRange(preset), [preset]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics"
        description="Engagement, plan progress, and conversion metrics"
        action={<DateRangePicker value={preset} onChange={(next) => set({ range: next })} />}
      />
      <KpiSection from={from} to={to} />
      <BreakdownsSection from={from} to={to} />
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Events</h2>
        <EventsExplorer />
      </section>
    </div>
  );
}
