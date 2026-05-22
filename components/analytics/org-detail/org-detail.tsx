"use client";

import { useQuery } from "@tanstack/react-query";
import { OrgActivitySection } from "@/components/analytics/org-activity-section";
import { organizationQuery } from "@/lib/analytics/queries";
import { useUrlState } from "@/lib/use-url-state";
import { FactsSection } from "./facts-section";
import { isSectionId, KpiStrip, type SectionId } from "./kpi-strip";
import { MembersSection } from "./members-section";
import { OrgTitleBar } from "./org-title-bar";
import { PlanSummarySection } from "./plan-summary-section";
import { TrackedActionsSection } from "./tracked-actions-section";

type OrgDetailProps = {
  slug: string;
};

export function OrgDetail({ slug }: OrgDetailProps) {
  const query = useQuery({
    ...organizationQuery(slug),
    select: (response) => response.organization
  });
  const data = query.data;
  const errorMessage = query.isError
    ? query.error instanceof Error
      ? query.error.message
      : "Failed to load organisation"
    : "";

  const { searchParams, set } = useUrlState();
  const rawSection = searchParams.get("section");
  const activeSection: SectionId = isSectionId(rawSection) ? rawSection : "activity";

  return (
    <div className="space-y-6">
      {query.isPending && <div className="text-sm text-muted-foreground">Loading organisation…</div>}
      {errorMessage && <div className="text-sm text-destructive">{errorMessage}</div>}

      {data && (
        <>
          <OrgTitleBar org={data} />
          <KpiStrip
            org={data}
            activeSection={activeSection}
            onSelect={(next) => set({ section: next === "activity" ? undefined : next })}
          />
          {activeSection === "activity" && (
            <div className="space-y-6">
              <OrgActivitySection slug={data.slug} companyId={data.id} companyName={data.name} />
              <PlanSummarySection org={data} />
            </div>
          )}
          {activeSection === "members" && <MembersSection members={data.members} />}
          {activeSection === "actions" && <TrackedActionsSection actions={data.tracked_actions} />}
          {activeSection === "facts" && <FactsSection facts={data.facts} />}
        </>
      )}
    </div>
  );
}
