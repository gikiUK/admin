"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { OrgFilters } from "@/lib/analytics/insights/cohort-spec";

type Props = {
  orgFilters: OrgFilters;
  onChange: (patch: Partial<OrgFilters>) => void;
};

export function CohortOrgExtras({ orgFilters, onChange }: Props) {
  const trackedActionsValue =
    orgFilters.has_tracked_actions === true ? "yes" : orgFilters.has_tracked_actions === false ? "no" : "any";

  function setTrackedActions(value: string) {
    if (value === "yes") onChange({ has_tracked_actions: true });
    else if (value === "no") onChange({ has_tracked_actions: false });
    else onChange({ has_tracked_actions: undefined });
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="space-y-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Signed up</span>
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-1">
            <Label className="text-xs">From</Label>
            <Input
              type="date"
              value={orgFilters.signed_up_from?.slice(0, 10) ?? ""}
              onChange={(e) => onChange({ signed_up_from: e.target.value || undefined })}
              className="h-8 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs">To</Label>
            <Input
              type="date"
              value={orgFilters.signed_up_to?.slice(0, 10) ?? ""}
              onChange={(e) => onChange({ signed_up_to: e.target.value || undefined })}
              className="h-8 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Has tracked actions</span>
        <ToggleGroup
          type="single"
          value={trackedActionsValue}
          onValueChange={(v) => v && setTrackedActions(v)}
          variant="outline"
          size="sm"
        >
          <ToggleGroupItem value="any">Any</ToggleGroupItem>
          <ToggleGroupItem value="yes">With actions</ToggleGroupItem>
          <ToggleGroupItem value="no">Without</ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}
