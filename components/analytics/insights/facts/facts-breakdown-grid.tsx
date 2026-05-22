"use client";

import { FactBreakdownChart } from "@/components/analytics/insights/facts/fact-breakdown-chart";
import { FactsBreakdownGridHeader } from "@/components/analytics/insights/facts/facts-breakdown-grid-header";
import { NotableDifferences } from "@/components/analytics/insights/facts/notable-differences";
import { FactsBreakdownGridSkeleton } from "@/components/analytics/insights/skeletons/facts-breakdown-grid-skeleton";
import { useCohort } from "@/lib/analytics/insights/cohort-context";
import { isEmptySpec } from "@/lib/analytics/insights/cohort-spec";
import { useBaselineFactsBreakdown } from "@/lib/analytics/insights/use-baseline-facts-breakdown";
import { useDebouncedValue } from "@/lib/analytics/insights/use-debounced-value";
import { useFactsBreakdown } from "@/lib/analytics/insights/use-facts-breakdown";
import { usePersistentKeys } from "@/lib/analytics/insights/use-persistent-keys";

const DEFAULT_FACT_KEYS = ["size", "industries", "measures_emissions", "has_reduction_targets"];
const FACT_KEYS_STORAGE_KEY = "giki:insights:facts:keys";

export function FactsBreakdownGrid() {
  const { spec } = useCohort();
  const debouncedSpec = useDebouncedValue(spec, 200);
  const [factKeys, setFactKeys] = usePersistentKeys(FACT_KEYS_STORAGE_KEY, DEFAULT_FACT_KEYS);
  const state = useFactsBreakdown(debouncedSpec, factKeys);
  const baselineState = useBaselineFactsBreakdown(factKeys);

  // Only show the baseline overlay when the cohort actually differs (otherwise the bars overlap).
  const showBaseline = !isEmptySpec(debouncedSpec);
  const baselineByKey =
    baselineState.status === "ready" ? new Map(baselineState.data.breakdowns.map((b) => [b.key, b])) : new Map();

  function addKey(key: string) {
    if (!factKeys.includes(key)) setFactKeys([...factKeys, key]);
  }

  function removeKey(key: string) {
    setFactKeys(factKeys.filter((k) => k !== key));
  }

  return (
    <div className="space-y-3">
      {showBaseline && state.status === "ready" && baselineState.status === "ready" && (
        <NotableDifferences cohort={state.data.breakdowns} baseline={baselineState.data.breakdowns} />
      )}

      <FactsBreakdownGridHeader showBaseline={showBaseline} selectedKeys={factKeys} onAdd={addKey} />

      {state.status === "loading" && <FactsBreakdownGridSkeleton count={factKeys.length} />}
      {state.status === "error" && <div className="text-sm text-destructive">{state.message}</div>}
      {state.status === "ready" && state.data.breakdowns.length === 0 && (
        <div className="text-sm text-muted-foreground">No facts selected. Click “Add fact”.</div>
      )}
      {state.status === "ready" && state.data.breakdowns.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2">
          {state.data.breakdowns.map((breakdown) => (
            <FactBreakdownChart
              key={breakdown.key}
              breakdown={breakdown}
              baseline={showBaseline ? baselineByKey.get(breakdown.key) : undefined}
              onRemove={() => removeKey(breakdown.key)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
