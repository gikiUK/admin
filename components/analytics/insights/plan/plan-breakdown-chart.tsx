"use client";

import { METADATA_KEY_LABELS } from "@/components/analytics/insights/plan/metadata-keys";
import { buildPlanSlices } from "@/components/analytics/insights/plan/plan-breakdown-slices";
import { PlanPieChart } from "@/components/analytics/insights/plan/plan-pie-chart";
import { PlanPieLegend } from "@/components/analytics/insights/plan/plan-pie-legend";
import { BreakdownCardHeader } from "@/components/analytics/insights/shared/breakdown-card-header";
import { Card, CardContent } from "@/components/ui/card";
import type { PlanBreakdown } from "@/lib/analytics/insights/insights-api";

type Props = {
  breakdown: PlanBreakdown;
  onRemove?: () => void;
};

const PIE_SIZE = 160;

export function PlanBreakdownChart({ breakdown, onRemove }: Props) {
  const slices = buildPlanSlices(breakdown);
  const title = METADATA_KEY_LABELS[breakdown.key] ?? breakdown.key;
  const hasData = slices.length > 0 && slices.some((s) => s.count > 0);

  const description = (
    <>
      {breakdown.total_with_metadata} actions
      {breakdown.missing_metadata > 0 && ` · ${breakdown.missing_metadata} missing metadata`}
      {breakdown.note && ` · ${breakdown.note}`}
    </>
  );

  return (
    <Card>
      <BreakdownCardHeader title={title} description={description} onRemove={onRemove} />
      <CardContent>
        {!hasData ? (
          <div className="text-xs text-muted-foreground">No data.</div>
        ) : (
          <div className="flex items-center gap-4">
            <PlanPieChart slices={slices} size={PIE_SIZE} />
            <PlanPieLegend slices={slices} maxHeight={PIE_SIZE} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
