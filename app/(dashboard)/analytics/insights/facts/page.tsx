"use client";

import { CohortSummaryPill } from "@/components/analytics/insights/cohort-summary-pill";
import { CsvDownloadButton } from "@/components/analytics/insights/csv-download-button";
import { FactsBreakdownGrid } from "@/components/analytics/insights/facts-breakdown-grid";
import { InsightsKpiStrip } from "@/components/analytics/insights/insights-kpi-strip";
import { PageHeader } from "@/components/page-header";
import { useCohort } from "@/lib/analytics/insights/cohort-context";
import { useCohortSummary } from "@/lib/analytics/insights/use-cohort-summary";

export default function FactsInsightsPage() {
  const { spec } = useCohort();
  const summary = useCohortSummary(spec);

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

      {summary.status === "loading" && <div className="text-sm text-muted-foreground">Loading cohort summary…</div>}
      {summary.status === "pending-backend" && (
        <div className="text-sm text-muted-foreground">Cohort summary endpoint isn't available yet.</div>
      )}
      {summary.status === "error" && <div className="text-sm text-destructive">{summary.message}</div>}
      {summary.status === "ready" && <InsightsKpiStrip data={summary.data} />}

      <FactsBreakdownGrid />
    </div>
  );
}
