"use client";

import {
  ENGAGEMENT_AXIS_LABELS,
  type EngagementAxis,
  type EngagementPoint
} from "@/components/analytics/actions/engagement/engagement-types";
import { formatPct } from "@/components/analytics/actions/shared/format";
import { MetricRow, TooltipCard } from "@/components/analytics/actions/shared/tooltip-card";

type Props = {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: unknown }>;
  axis: EngagementAxis;
};

export function EngagementTooltip({ active, payload, axis }: Props) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as EngagementPoint;
  return (
    <TooltipCard title={point.title}>
      <MetricRow label={ENGAGEMENT_AXIS_LABELS[axis]} value={formatPct(point.coverage)} />
      <MetricRow label="Completion" value={formatPct(point.completion_rate)} />
      <MetricRow label="Adoption" value={point.adoption_count} />
      <MetricRow label="Completed" value={point.completion_count} />
    </TooltipCard>
  );
}
