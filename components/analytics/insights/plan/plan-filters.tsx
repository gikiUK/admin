"use client";

import { CustomActionsToggle } from "@/components/analytics/insights/plan/custom-actions-toggle";
import { PlanStatusFilter } from "@/components/analytics/insights/plan/plan-status-filter";
import { PreGikiToggle } from "@/components/analytics/insights/plan/pre-giki-toggle";
import { Card, CardContent } from "@/components/ui/card";
import type { PreGikiFilter } from "@/lib/analytics/insights/insights-api";

type Props = {
  includeCustom: boolean;
  onIncludeCustomChange: (next: boolean) => void;
  preGiki: PreGikiFilter;
  onPreGikiChange: (next: PreGikiFilter) => void;
  statusFilter: string[];
  onStatusFilterChange: (next: string[]) => void;
};

export function PlanFilters({
  includeCustom,
  onIncludeCustomChange,
  preGiki,
  onPreGikiChange,
  statusFilter,
  onStatusFilterChange
}: Props) {
  return (
    <Card>
      <CardContent className="space-y-5 py-4">
        <PlanStatusFilter value={statusFilter} onChange={onStatusFilterChange} />
        <div className="grid gap-5 md:grid-cols-2">
          <PreGikiToggle value={preGiki} onChange={onPreGikiChange} />
          <CustomActionsToggle value={includeCustom} onChange={onIncludeCustomChange} />
        </div>
      </CardContent>
    </Card>
  );
}
