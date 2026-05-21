"use client";

import { MultiCheckGroup } from "@/components/analytics/insights/multi-check-group";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { PreGikiFilter } from "@/lib/analytics/insights/insights-api";

const STATUS_OPTIONS = [
  { value: "not_started", label: "Not started" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
  { value: "rejected", label: "Rejected" }
];

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
        <MultiCheckGroup
          legend="Status"
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={onStatusFilterChange}
        />

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Pre-Giki status</span>
            <ToggleGroup
              type="single"
              value={preGiki}
              onValueChange={(v) => v && onPreGikiChange(v as PreGikiFilter)}
              variant="outline"
              size="sm"
            >
              <ToggleGroupItem value="all">All</ToggleGroupItem>
              <ToggleGroupItem value="none">None (new)</ToggleGroupItem>
              <ToggleGroupItem value="already_doing">Already doing</ToggleGroupItem>
              <ToggleGroupItem value="previously_done">Previously done</ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Custom actions</span>
            <Label className="flex cursor-pointer items-center gap-2 text-sm font-normal">
              <Switch checked={includeCustom} onCheckedChange={onIncludeCustomChange} />
              <span>Include custom actions</span>
              <span className="text-xs text-muted-foreground">(no rich metadata)</span>
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
