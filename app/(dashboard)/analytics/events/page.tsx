"use client";

import { EventsExplorer } from "@/components/analytics/events-explorer";
import { PageHeader } from "@/components/page-header";

export default function AnalyticsEventsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Events" description="Raw event log" />
      <EventsExplorer />
    </div>
  );
}
