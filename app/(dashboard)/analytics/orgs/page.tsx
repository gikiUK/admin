"use client";

import { OrgsTab } from "@/components/analytics/orgs-tab";
import { SummaryGate } from "@/components/analytics/summary-gate";
import { PageHeader } from "@/components/page-header";
import { useSummaryContext } from "@/lib/analytics/summary-context";

export default function AnalyticsOrgsPage() {
  const summary = useSummaryContext();
  return (
    <div className="space-y-6">
      <PageHeader title="Orgs" description="Activity and trends across organisations" />
      <SummaryGate loadingLabel="Loading orgs…">
        {(data) => <OrgsTab summary={data} isLoading={summary.status === "loading"} />}
      </SummaryGate>
    </div>
  );
}
