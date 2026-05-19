"use client";

import { CohortBuilder } from "@/components/analytics/insights/cohort-builder";
import { CsvDownloadButton } from "@/components/analytics/insights/csv-download-button";
import { FactsBreakdownGrid } from "@/components/analytics/insights/facts-breakdown-grid";
import { InsightsKpiStrip } from "@/components/analytics/insights/insights-kpi-strip";
import { PageHeader } from "@/components/page-header";
import { useCohort } from "@/lib/analytics/insights/cohort-context";
import { useCohortSummary } from "@/lib/analytics/insights/use-cohort-summary";

export default function FactsInsightsPage() {
  const { spec } = useCohort();
  const summary = useCohortSummary(spec);

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

      <CohortBuilder />

      {summary.status === "loading" && <div className="text-sm text-muted-foreground">Loading cohort summary…</div>}
      {summary.status === "error" && <div className="text-sm text-destructive">{summary.message}</div>}
      {summary.status === "ready" && <InsightsKpiStrip data={summary.data} />}

      <FactsBreakdownGrid />
    </div>
  );
}
