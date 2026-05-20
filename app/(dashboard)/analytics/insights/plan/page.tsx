"use client";

import { useMemo, useState } from "react";
import { CohortSummaryPill } from "@/components/analytics/insights/cohort-summary-pill";
import { CsvDownloadButton } from "@/components/analytics/insights/csv-download-button";
import { PlanBreakdownGrid } from "@/components/analytics/insights/plan-breakdown-grid";
import { PlanFilters } from "@/components/analytics/insights/plan-filters";
import { PlanKpiStrip } from "@/components/analytics/insights/plan-kpi-strip";
import { PlanStatusChart } from "@/components/analytics/insights/plan-status-chart";
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

  const csvBody = useMemo(
    () => ({
      ...spec,
      include_custom: includeCustom,
      pre_giki_filter: preGiki,
      status_filter: statusFilter.length > 0 ? statusFilter : undefined
    }),
    [spec, includeCustom, preGiki, statusFilter]
  );

  const cohortSize = overview.status === "ready" ? overview.data.cohort_size : undefined;

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

      {overview.status === "loading" && <div className="text-sm text-muted-foreground">Loading plan summary…</div>}
      {overview.status === "error" && <div className="text-sm text-destructive">{overview.message}</div>}
      {overview.status === "ready" && (
        <>
          <PlanKpiStrip data={overview.data} />
          <PlanStatusChart byStatus={overview.data.kpis.actions_by_status} />
        </>
      )}

      <PlanBreakdownGrid includeCustom={includeCustom} preGiki={preGiki} statusFilter={statusFilter} />
    </div>
  );
}
