"use client";

import { TopActionTypes } from "@/components/analytics/top-action-types";
import { TopCompletedActions } from "@/components/analytics/top-completed-actions";
import type { AnalyticsSummary } from "@/lib/analytics/api";

type BreakdownsSectionProps = {
  data: AnalyticsSummary;
};

export function BreakdownsSection({ data }: BreakdownsSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <TopActionTypes items={data.top_action_types ?? []} />
      <TopCompletedActions items={data.top_completed_action_types} />
    </div>
  );
}
