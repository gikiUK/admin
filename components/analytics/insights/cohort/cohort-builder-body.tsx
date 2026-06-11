"use client";

import { CohortFactFilters } from "@/components/analytics/insights/cohort/cohort-fact-filters";
import { CohortOrgExtras } from "@/components/analytics/insights/cohort/cohort-org-extras";
import { CohortTagsRow } from "@/components/analytics/insights/cohort/cohort-tags-row";
import { CohortTierStatusRow } from "@/components/analytics/insights/cohort/cohort-tier-status-row";
import { SignupLinkPicker } from "@/components/analytics/insights/cohort/signup-link-picker";
import { useCohort } from "@/lib/analytics/insights/cohort-context";
import type { OrgFilters } from "@/lib/analytics/insights/cohort-spec";

export function CohortBuilderBody() {
  const { draft, setDraft } = useCohort();

  function updateOrg(patch: Partial<OrgFilters>) {
    setDraft({ ...draft, org_filters: { ...draft.org_filters, ...patch } });
  }

  return (
    <>
      <CohortTierStatusRow orgFilters={draft.org_filters} onChange={updateOrg} />
      <CohortTagsRow orgFilters={draft.org_filters} onChange={updateOrg} />
      <SignupLinkPicker
        selectedUuids={draft.org_filters.signup_link_uuids ?? []}
        onChange={(next) => updateOrg({ signup_link_uuids: next })}
      />
      <CohortOrgExtras orgFilters={draft.org_filters} onChange={updateOrg} />
      <CohortFactFilters />
    </>
  );
}
