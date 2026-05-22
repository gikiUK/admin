"use client";

import { SignedUpRange } from "@/components/analytics/insights/cohort/signed-up-range";
import { TrackedActionsToggle } from "@/components/analytics/insights/cohort/tracked-actions-toggle";
import type { OrgFilters } from "@/lib/analytics/insights/cohort-spec";

type Props = {
  orgFilters: OrgFilters;
  onChange: (patch: Partial<OrgFilters>) => void;
};

export function CohortOrgExtras({ orgFilters, onChange }: Props) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <SignedUpRange from={orgFilters.signed_up_from} to={orgFilters.signed_up_to} onChange={onChange} />
      <TrackedActionsToggle
        value={orgFilters.has_tracked_actions}
        onChange={(next) => onChange({ has_tracked_actions: next })}
      />
    </div>
  );
}
