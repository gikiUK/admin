"use client";

import { Plus } from "lucide-react";
import { FactFilterRow } from "@/components/analytics/insights/cohort/fact-filter-row";
import { Button } from "@/components/ui/button";
import { useCohort } from "@/lib/analytics/insights/cohort-context";
import { type FactFilter, newFactFilterId } from "@/lib/analytics/insights/cohort-spec";
import { useLiveDataset } from "@/lib/analytics/use-live-dataset";

export function CohortFactFilters() {
  const { draft, setDraft } = useCohort();
  const { data: dataset } = useLiveDataset();

  function updateFactFilters(next: FactFilter[]) {
    setDraft({ ...draft, fact_filters: next });
  }

  function addFactFilter() {
    updateFactFilters([...draft.fact_filters, { id: newFactFilterId(), key: "", values: [] }]);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Fact filters (AND)</span>
        <Button variant="outline" size="sm" onClick={addFactFilter}>
          <Plus className="size-3" />
          Add fact filter
        </Button>
      </div>
      {draft.fact_filters.length === 0 ? (
        <p className="text-xs text-muted-foreground">No fact filters. Cohort defined by org filters only.</p>
      ) : (
        <div className="space-y-2">
          {draft.fact_filters.map((filter) => (
            <FactFilterRow
              key={filter.id}
              filter={filter}
              dataset={dataset}
              onChange={(next) => updateFactFilters(draft.fact_filters.map((f) => (f.id === filter.id ? next : f)))}
              onRemove={() => updateFactFilters(draft.fact_filters.filter((f) => f.id !== filter.id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
