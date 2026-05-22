"use client";

import { type QuadrantPoint, quadrantLabel } from "@/components/analytics/actions/catalog/catalog-types";
import { formatPct } from "@/components/analytics/actions/shared/format";
import { MetricRow, TooltipCard } from "@/components/analytics/actions/shared/tooltip-card";

type Props = {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: unknown }>;
};

export function CatalogQuadrantTooltip({ active, payload }: Props) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as QuadrantPoint;
  return (
    <TooltipCard title={point.title} subtitle={quadrantLabel(point.quadrant)}>
      <MetricRow label="Adoption" value={point.adoption_count} />
      <MetricRow label="Completed" value={point.completion_count} />
      <MetricRow label="Completion" value={formatPct(point.completion_rate)} />
    </TooltipCard>
  );
}
