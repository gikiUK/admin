"use client";

import { DurationCards } from "@/components/analytics/actions/funnel/duration-cards";
import { FunnelKpis } from "@/components/analytics/actions/funnel/funnel-kpis";
import { FunnelSankey } from "@/components/analytics/actions/funnel/funnel-sankey";
import { SectionCard } from "@/components/analytics/actions/shared/section-card";
import type { ActionFunnel } from "@/lib/analytics/actions-api";

type Props = {
  data: ActionFunnel;
};

export function FunnelSection({ data }: Props) {
  return (
    <div className="space-y-4">
      <FunnelKpis kpis={data.kpis} />
      <SectionCard
        title="Lifecycle funnel"
        description="Each tracked action created in range is followed by its first lifecycle outcome."
      >
        <FunnelSankey data={data} />
      </SectionCard>
      <DurationCards durations={data.durations} />
    </div>
  );
}
