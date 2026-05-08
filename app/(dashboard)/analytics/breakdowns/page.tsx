"use client";

import { BreakdownsSection } from "@/components/analytics/breakdowns-section";
import { SummaryGate } from "@/components/analytics/summary-gate";
import { PageHeader } from "@/components/page-header";

export default function AnalyticsBreakdownsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Breakdowns" description="Subscription, tier, and revenue distributions" />
      <SummaryGate loadingLabel="Loading breakdowns…">{(data) => <BreakdownsSection data={data} />}</SummaryGate>
    </div>
  );
}
