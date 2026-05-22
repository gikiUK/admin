"use client";

import { PlanBreakdownChart } from "@/components/analytics/insights/plan/plan-breakdown-chart";
import { PlanBreakdownGridHeader } from "@/components/analytics/insights/plan/plan-breakdown-grid-header";
import { PlanBreakdownGridSkeleton } from "@/components/analytics/insights/skeletons/plan-breakdown-grid-skeleton";
import { useCohort } from "@/lib/analytics/insights/cohort-context";
import type { PreGikiFilter } from "@/lib/analytics/insights/insights-api";
import { usePersistentKeys } from "@/lib/analytics/insights/use-persistent-keys";
import { usePlanBreakdown } from "@/lib/analytics/insights/use-plan-breakdown";

const DEFAULT_METADATA_KEYS = ["impact_opportunity", "cost_saving_potential", "ghg_scope", "theme"];
const METADATA_KEYS_STORAGE_KEY = "giki:insights:plan:metadata-keys";

type Props = {
  includeCustom: boolean;
  preGiki: PreGikiFilter;
  statusFilter: string[];
};

export function PlanBreakdownGrid({ includeCustom, preGiki, statusFilter }: Props) {
  const { spec } = useCohort();
  const [metadataKeys, setMetadataKeys] = usePersistentKeys(METADATA_KEYS_STORAGE_KEY, DEFAULT_METADATA_KEYS);
  const state = usePlanBreakdown(spec, {
    metadata_keys: metadataKeys,
    include_custom: includeCustom,
    pre_giki_filter: preGiki,
    status_filter: statusFilter.length > 0 ? statusFilter : undefined
  });

  function addKey(key: string) {
    if (!metadataKeys.includes(key)) setMetadataKeys([...metadataKeys, key]);
  }

  function removeKey(key: string) {
    setMetadataKeys(metadataKeys.filter((k) => k !== key));
  }

  return (
    <div className="space-y-3">
      <PlanBreakdownGridHeader selectedKeys={metadataKeys} onAdd={addKey} />

      {state.status === "loading" && <PlanBreakdownGridSkeleton count={metadataKeys.length} />}
      {state.status === "error" && <div className="text-sm text-destructive">{state.message}</div>}
      {state.status === "ready" && state.data.breakdowns.length === 0 && (
        <div className="text-sm text-muted-foreground">No fields selected. Click “Add field”.</div>
      )}
      {state.status === "ready" && state.data.breakdowns.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2">
          {state.data.breakdowns.map((breakdown) => (
            <PlanBreakdownChart key={breakdown.key} breakdown={breakdown} onRemove={() => removeKey(breakdown.key)} />
          ))}
        </div>
      )}
    </div>
  );
}
