"use client";

import { ChevronsUpDown, Plus } from "lucide-react";
import { useState } from "react";
import { PlanBreakdownGridSkeleton } from "@/components/analytics/insights/insights-skeletons";
import { METADATA_KEY_LABELS, PlanBreakdownChart } from "@/components/analytics/insights/plan-breakdown-chart";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCohort } from "@/lib/analytics/insights/cohort-context";
import type { PreGikiFilter } from "@/lib/analytics/insights/insights-api";
import { usePersistentKeys } from "@/lib/analytics/insights/use-persistent-keys";
import { usePlanBreakdown } from "@/lib/analytics/insights/use-plan-breakdown";

const DEFAULT_METADATA_KEYS = ["impact_opportunity", "cost_saving_potential", "ghg_scope", "theme"];
const METADATA_KEYS_STORAGE_KEY = "giki:insights:plan:metadata-keys";

const ALL_KEYS = Object.keys(METADATA_KEY_LABELS);

type Props = {
  includeCustom: boolean;
  preGiki: PreGikiFilter;
  statusFilter: string[];
};

export function PlanBreakdownGrid({ includeCustom, preGiki, statusFilter }: Props) {
  const { spec } = useCohort();
  const [metadataKeys, setMetadataKeys] = usePersistentKeys(METADATA_KEYS_STORAGE_KEY, DEFAULT_METADATA_KEYS);
  const [pickerOpen, setPickerOpen] = useState(false);
  const state = usePlanBreakdown(spec, {
    metadata_keys: metadataKeys,
    include_custom: includeCustom,
    pre_giki_filter: preGiki,
    status_filter: statusFilter.length > 0 ? statusFilter : undefined
  });

  function addKey(key: string) {
    if (!metadataKeys.includes(key)) setMetadataKeys([...metadataKeys, key]);
    setPickerOpen(false);
  }

  function removeKey(key: string) {
    setMetadataKeys(metadataKeys.filter((k) => k !== key));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Action metadata breakdowns</h2>
        <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="size-3" />
              Add field
              <ChevronsUpDown className="size-3 ml-1" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-0" align="end">
            <Command>
              <CommandInput placeholder="Search fields…" />
              <CommandList>
                <CommandEmpty>No fields left.</CommandEmpty>
                <CommandGroup>
                  {ALL_KEYS.filter((k) => !metadataKeys.includes(k)).map((key) => (
                    <CommandItem key={key} value={METADATA_KEY_LABELS[key]} onSelect={() => addKey(key)}>
                      <span>{METADATA_KEY_LABELS[key]}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

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
