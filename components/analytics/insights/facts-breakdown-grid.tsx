"use client";

import { ChevronsUpDown, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { FactBreakdownChart } from "@/components/analytics/insights/fact-breakdown-chart";
import { NotableDifferences } from "@/components/analytics/insights/notable-differences";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCohort } from "@/lib/analytics/insights/cohort-context";
import { isEmptySpec } from "@/lib/analytics/insights/cohort-spec";
import { useBaselineFactsBreakdown } from "@/lib/analytics/insights/use-baseline-facts-breakdown";
import { useFactsBreakdown } from "@/lib/analytics/insights/use-facts-breakdown";
import { useLiveDataset } from "@/lib/analytics/use-live-dataset";

const DEFAULT_FACT_KEYS = ["size", "industries", "measures_emissions", "has_reduction_targets"];

export function FactsBreakdownGrid() {
  const { spec } = useCohort();
  const [factKeys, setFactKeys] = useState<string[]>(DEFAULT_FACT_KEYS);
  const [pickerOpen, setPickerOpen] = useState(false);
  const { data: dataset } = useLiveDataset();
  const state = useFactsBreakdown(spec, factKeys);
  const baselineState = useBaselineFactsBreakdown(factKeys);

  // Only show the baseline overlay when the cohort actually differs from the baseline
  // (otherwise the two bars overlap and it just looks like clutter).
  const showBaseline = !isEmptySpec(spec);

  const baselineByKey = useMemo(() => {
    if (baselineState.status !== "ready") return new Map();
    return new Map(baselineState.data.breakdowns.map((b) => [b.key, b]));
  }, [baselineState]);

  function addKey(key: string) {
    if (!factKeys.includes(key)) setFactKeys([...factKeys, key]);
    setPickerOpen(false);
  }

  function removeKey(key: string) {
    setFactKeys(factKeys.filter((k) => k !== key));
  }

  return (
    <div className="space-y-3">
      {showBaseline && state.status === "ready" && baselineState.status === "ready" && (
        <NotableDifferences cohort={state.data.breakdowns} baseline={baselineState.data.breakdowns} />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Fact breakdowns</h2>
          {showBaseline && (
            <p className="text-xs text-muted-foreground">
              Bars show how the cohort differs from the all-orgs baseline (percentage points). Click a bar to filter.
            </p>
          )}
        </div>
        <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="size-3" />
              Add fact
              <ChevronsUpDown className="size-3 ml-1" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[340px] p-0" align="end">
            <Command>
              <CommandInput placeholder="Search facts…" />
              <CommandList>
                {dataset === null ? (
                  <CommandEmpty>Loading dataset…</CommandEmpty>
                ) : (
                  <CommandGroup>
                    {dataset.data.questions
                      .filter((q) => q.enabled && !factKeys.includes(q.key))
                      .map((q) => (
                        <CommandItem
                          key={q.key}
                          value={`${q.label} ${q.key}`}
                          onSelect={() => addKey(q.key)}
                          className="flex flex-col items-start gap-0.5 py-2"
                        >
                          <span className="text-sm">{q.label}</span>
                          <span className="text-[10px] text-muted-foreground">{q.key}</span>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {state.status === "loading" && <div className="text-sm text-muted-foreground">Loading breakdowns…</div>}
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
