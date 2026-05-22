"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { PreGikiFilter } from "@/lib/analytics/insights/insights-api";

type Props = {
  value: PreGikiFilter;
  onChange: (next: PreGikiFilter) => void;
};

export function PreGikiToggle({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Pre-Giki status</span>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(v) => v && onChange(v as PreGikiFilter)}
        variant="outline"
        size="sm"
      >
        <ToggleGroupItem value="all">All</ToggleGroupItem>
        <ToggleGroupItem value="none">None (new)</ToggleGroupItem>
        <ToggleGroupItem value="already_doing">Already doing</ToggleGroupItem>
        <ToggleGroupItem value="previously_done">Previously done</ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
