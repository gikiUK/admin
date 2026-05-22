"use client";

import { LeaderboardChart } from "@/components/analytics/actions/leaderboard/leaderboard-chart";
import { AsyncSection } from "@/components/analytics/async-section";
import { useCohort } from "@/lib/analytics/insights/cohort-context";
import type { PreGikiFilter } from "@/lib/analytics/insights/insights-api";
import { useDebouncedValue } from "@/lib/analytics/insights/use-debounced-value";
import { usePlanPopularActions } from "@/lib/analytics/insights/use-plan-popular-actions";

type Props = {
  includeCustom: boolean;
  preGiki: PreGikiFilter;
  statusFilter: string[];
};

export function PlanPopularActions({ includeCustom, preGiki, statusFilter }: Props) {
  const { spec } = useCohort();
  const debouncedSpec = useDebouncedValue(spec, 200);

  const state = usePlanPopularActions(debouncedSpec, {
    include_custom: includeCustom,
    pre_giki_filter: preGiki,
    status_filter: statusFilter.length > 0 ? statusFilter : undefined,
    limit: 20
  });

  return (
    <AsyncSection
      state={state}
      endpoint="POST /admin/analytics/insights/plan/popular_actions"
      loadingLabel="Loading popular actions…"
    >
      {(data) => <LeaderboardChart rows={data.actions} />}
    </AsyncSection>
  );
}
