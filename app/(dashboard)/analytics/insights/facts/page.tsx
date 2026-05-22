"use client";

import { AsyncSection } from "@/components/analytics/async-section";
import { CohortSummaryPill } from "@/components/analytics/insights/cohort/cohort-summary-pill";
import { FactsBreakdownGrid } from "@/components/analytics/insights/facts/facts-breakdown-grid";
import { InsightsKpiStrip } from "@/components/analytics/insights/facts/insights-kpi-strip";
import { CsvDownloadButton } from "@/components/analytics/insights/shared/csv-download-button";
import { KpiStripSkeleton } from "@/components/analytics/insights/skeletons/kpi-strip-skeleton";
import { PageHeader } from "@/components/page-header";
import { useCohort } from "@/lib/analytics/insights/cohort-context";
import { useCohortSummary } from "@/lib/analytics/insights/use-cohort-summary";
import { useDebouncedValue } from "@/lib/analytics/insights/use-debounced-value";

export default function FactsInsightsPage() {
  const { spec } = useCohort();
  const debouncedSpec = useDebouncedValue(spec, 200);
  const summary = useCohortSummary(debouncedSpec);

  const cohortSize = summary.status === "ready" ? summary.data.cohort_size : undefined;
  const totalOrgs = summary.status === "ready" ? summary.data.total_orgs_in_db : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Facts insights"
        description="Define a cohort and aggregate fact values across it."
        action={
          <CsvDownloadButton
            endpoint="/admin/analytics/insights/facts/export"
            body={spec}
            fallbackFilename="facts-insights.csv"
            label="Download CSV (one row per org)"
          />
        }
      />

      <CohortSummaryPill cohortSize={cohortSize} totalOrgs={totalOrgs} />

      <AsyncSection
        state={summary}
        endpoint="GET /admin/analytics/insights/facts/summary"
        loadingFallback={<KpiStripSkeleton />}
      >
        {(data) => <InsightsKpiStrip data={data} />}
      </AsyncSection>

      <FactsBreakdownGrid />
    </div>
  );
}
