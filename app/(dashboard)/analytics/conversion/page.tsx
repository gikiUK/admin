"use client";

import { ConversionTab } from "@/components/analytics/conversion-tab";
import { SummaryGate } from "@/components/analytics/summary-gate";
import { PageHeader } from "@/components/page-header";

export default function AnalyticsConversionPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Conversion" description="Funnels and adoption" />
      <SummaryGate loadingLabel="Loading conversion…">{(data) => <ConversionTab data={data} />}</SummaryGate>
    </div>
  );
}
