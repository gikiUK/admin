"use client";

import { SectionCard } from "@/components/analytics/actions/shared/section-card";
import { splitRisersFallers } from "@/components/analytics/actions/trends/risers-fallers";
import { TrendList } from "@/components/analytics/actions/trends/trend-list";
import type { ActionTrends } from "@/lib/analytics/actions-api";

type Props = {
  data: ActionTrends;
  topN?: number;
};

export function TrendsSection({ data, topN = 5 }: Props) {
  const { risers, fallers } = splitRisersFallers(data.actions, topN);

  if (risers.length === 0 && fallers.length === 0) {
    return <SectionCard title="Trends" empty={`No trend signal in the last ${data.weeks} weeks.`} />;
  }

  return (
    <SectionCard
      title="Risers and fallers"
      description={`Weekly adoption over the last ${data.weeks} weeks. Ranking by least-squares slope.`}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <TrendList title="Risers" rows={risers} direction="up" />
        <TrendList title="Fallers" rows={fallers} direction="down" />
      </div>
    </SectionCard>
  );
}
