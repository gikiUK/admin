"use client";

import type { CohortChip } from "@/components/analytics/insights/cohort/cohort-chips";
import { Badge } from "@/components/ui/badge";

type Props = {
  chips: CohortChip[];
  empty?: boolean;
};

export function CohortChipsList({ chips, empty }: Props) {
  return (
    <div className="flex flex-1 flex-wrap items-center gap-1.5">
      {empty ? (
        <span className="text-xs text-muted-foreground">All orgs (no filters)</span>
      ) : (
        chips.map((chip) => (
          <Badge key={chip.id} variant="secondary" className="text-[11px] font-normal">
            <span className="text-muted-foreground">{chip.label}:</span>
            <span className="ml-1">{chip.value}</span>
          </Badge>
        ))
      )}
    </div>
  );
}
