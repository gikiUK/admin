"use client";

import { useEffect, useState } from "react";
import { OrgActivitySection } from "@/components/analytics/org-activity-section";
import { type AnalyticsOrganizationDetail, fetchOrganization } from "@/lib/analytics/api";
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
  const [data, setData] = useState<AnalyticsOrganizationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { searchParams, set } = useUrlState();
  const rawSection = searchParams.get("section");
  const activeSection: SectionId = isSectionId(rawSection) ? rawSection : "activity";

  useEffect(() => {
    setLoading(true);
    setError("");
    fetchOrganization(slug)
      .then((response) => setData(response.organization))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load organisation"))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className="space-y-6">
      {loading && <div className="text-sm text-muted-foreground">Loading organisation…</div>}
      {error && <div className="text-sm text-destructive">{error}</div>}

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
