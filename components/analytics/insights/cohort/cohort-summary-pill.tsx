"use client";

import { RotateCcw } from "lucide-react";
import { buildCohortChips } from "@/components/analytics/insights/cohort/cohort-chips";
import { CohortChipsList } from "@/components/analytics/insights/cohort/cohort-chips-list";
import { CohortEditSheet } from "@/components/analytics/insights/cohort/cohort-edit-sheet";
import { CohortSizeStat } from "@/components/analytics/insights/cohort/cohort-size-stat";
import { Button } from "@/components/ui/button";
import { useCohort } from "@/lib/analytics/insights/cohort-context";
import { isEmptySpec } from "@/lib/analytics/insights/cohort-spec";
import { useLiveDataset } from "@/lib/analytics/use-live-dataset";

type Props = {
  cohortSize?: number;
  totalOrgs?: number;
};

export function CohortSummaryPill({ cohortSize, totalOrgs }: Props) {
  const { spec, reset } = useCohort();
  const { data: dataset } = useLiveDataset();

  const chips = buildCohortChips(spec, dataset);
  const empty = isEmptySpec(spec);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border bg-card px-3 py-2">
      <CohortSizeStat cohortSize={cohortSize} totalOrgs={totalOrgs} />
      <CohortChipsList chips={chips} empty={empty} />
      <div className="flex items-center gap-1">
        {!empty && (
          <Button variant="ghost" size="sm" onClick={reset} className="h-7 text-xs">
            <RotateCcw className="size-3" />
            Reset
          </Button>
        )}
        <CohortEditSheet />
      </div>
    </div>
  );
}
