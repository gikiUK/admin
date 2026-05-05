"use client";

import { useCallback } from "react";
import { OrgDetail } from "@/components/analytics/org-detail";
import { OrgKpis } from "@/components/analytics/org-kpis";
import { OrgsExplorer } from "@/components/analytics/orgs-explorer";
import type { AnalyticsSummary } from "@/lib/analytics/api";
import { useUrlState } from "@/lib/use-url-state";

const TABLE_FILTER_KEYS = ["query", "tier", "status", "order", "page"] as const;

type OrgsTabProps = {
  summary: AnalyticsSummary | null;
  isLoading: boolean;
};

export function OrgsTab({ summary, isLoading }: OrgsTabProps) {
  const { searchParams, set } = useUrlState();
  const selectedSlug = searchParams.get("org") ?? null;

  const handleSelect = useCallback(
    (slug: string) => {
      const patch: Record<string, undefined | string> = { org: slug };
      for (const key of TABLE_FILTER_KEYS) patch[key] = undefined;
      set(patch);
    },
    [set]
  );

  const handleBack = useCallback(() => {
    set({ org: undefined });
  }, [set]);

  if (selectedSlug) {
    return <OrgDetail slug={selectedSlug} onBack={handleBack} />;
  }

  return (
    <div className="space-y-6">
      <OrgKpis data={summary} isLoading={isLoading} />
      <OrgsExplorer onSelect={handleSelect} />
    </div>
  );
}
