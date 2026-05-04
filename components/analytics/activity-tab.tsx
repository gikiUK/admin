"use client";

import { EventsTimeSeries } from "@/components/analytics/events-time-series";
import type { AnalyticsSummary } from "@/lib/analytics/api";

type ActivityTabProps = {
  data: AnalyticsSummary;
};

export function ActivityTab({ data }: ActivityTabProps) {
  return (
    <div className="space-y-4">
      <EventsTimeSeries data={data.events_over_time ?? []} />
    </div>
  );
}
