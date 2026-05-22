"use client";

import { CohortFactFilters } from "@/components/analytics/insights/cohort/cohort-fact-filters";
import { CohortOrgExtras } from "@/components/analytics/insights/cohort/cohort-org-extras";
import { CohortTagsRow } from "@/components/analytics/insights/cohort/cohort-tags-row";
import { CohortTierStatusRow } from "@/components/analytics/insights/cohort/cohort-tier-status-row";
import { WorkshopPicker } from "@/components/analytics/insights/cohort/workshop-picker";
import { useCohort } from "@/lib/analytics/insights/cohort-context";
import type { OrgFilters } from "@/lib/analytics/insights/cohort-spec";

export function CohortBuilderBody() {
  const { spec, setSpec } = useCohort();

  function updateOrg(patch: Partial<OrgFilters>) {
    setSpec({ ...spec, org_filters: { ...spec.org_filters, ...patch } });
  }

  return (
    <>
      <CohortTierStatusRow orgFilters={spec.org_filters} onChange={updateOrg} />
      <CohortTagsRow orgFilters={spec.org_filters} onChange={updateOrg} />
      <WorkshopPicker
        selectedUuids={spec.org_filters.workshop_uuids ?? []}
        onChange={(next) => updateOrg({ workshop_uuids: next })}
      />
      <CohortOrgExtras orgFilters={spec.org_filters} onChange={updateOrg} />
      <CohortFactFilters />
    </>
  );
}
