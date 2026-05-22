"use client";

import { useState } from "react";
import { AsyncSection } from "@/components/analytics/async-section";
import { CohortSummaryPill } from "@/components/analytics/insights/cohort/cohort-summary-pill";
import { PlanBreakdownGrid } from "@/components/analytics/insights/plan/plan-breakdown-grid";
import { PlanFilters } from "@/components/analytics/insights/plan/plan-filters";
import { PlanKpiStrip } from "@/components/analytics/insights/plan/plan-kpi-strip";
import { PlanStatusChart } from "@/components/analytics/insights/plan/plan-status-chart";
import { CsvDownloadButton } from "@/components/analytics/insights/shared/csv-download-button";
import { KpiStripSkeleton } from "@/components/analytics/insights/skeletons/kpi-strip-skeleton";
import { PlanStatusChartSkeleton } from "@/components/analytics/insights/skeletons/plan-status-chart-skeleton";
import { PageHeader } from "@/components/page-header";
import { useCohort } from "@/lib/analytics/insights/cohort-context";
import type { PreGikiFilter } from "@/lib/analytics/insights/insights-api";
import { usePlanBreakdown } from "@/lib/analytics/insights/use-plan-breakdown";

export default function PlanInsightsPage() {
  const { spec } = useCohort();
  const [includeCustom, setIncludeCustom] = useState(false);
  const [preGiki, setPreGiki] = useState<PreGikiFilter>("all");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  const overview = usePlanBreakdown(spec, {
    metadata_keys: [],
    include_custom: includeCustom,
    pre_giki_filter: preGiki,
    status_filter: statusFilter.length > 0 ? statusFilter : undefined
  });

  const csvBody = {
    ...spec,
    include_custom: includeCustom,
    pre_giki_filter: preGiki,
    status_filter: statusFilter.length > 0 ? statusFilter : undefined
  };

  const cohortSize = overview.status === "ready" ? overview.data.cohort_size : undefined;

  const overviewLoadingFallback = (
    <>
      <KpiStripSkeleton />
      <PlanStatusChartSkeleton />
    </>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Plan insights"
        description="Define a cohort, then break down plan actions by metadata."
        action={
          <CsvDownloadButton
            endpoint="/admin/analytics/insights/plan/export"
            body={csvBody}
            fallbackFilename="plan-insights.csv"
            label="Download CSV (one row per plan action)"
          />
        }
      />

      <CohortSummaryPill cohortSize={cohortSize} />

      <PlanFilters
        includeCustom={includeCustom}
        onIncludeCustomChange={setIncludeCustom}
        preGiki={preGiki}
        onPreGikiChange={setPreGiki}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <AsyncSection
        state={overview}
        endpoint="GET /admin/analytics/insights/plan/summary"
        loadingFallback={overviewLoadingFallback}
      >
        {(data) => (
          <>
            <PlanKpiStrip data={data} />
            <PlanStatusChart byStatus={data.kpis.actions_by_status} />
          </>
        )}
      </AsyncSection>

      <PlanBreakdownGrid includeCustom={includeCustom} preGiki={preGiki} statusFilter={statusFilter} />
    </div>
  );
}
