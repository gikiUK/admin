"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { OrgKpis } from "@/components/analytics/org-kpis";
import { OrgsActiveKpis } from "@/components/analytics/orgs-active-kpis";
import { OrgsExplorer } from "@/components/analytics/orgs-explorer";
import type { AnalyticsSummary } from "@/lib/analytics/api";

type OrgsTabProps = {
  summary: AnalyticsSummary | null;
  isLoading: boolean;
};

export function OrgsTab({ summary, isLoading }: OrgsTabProps) {
  const router = useRouter();
  const handleSelect = useCallback(
    (slug: string) => router.push(`/analytics/orgs/${encodeURIComponent(slug)}`),
    [router]
  );

  return (
    <div className="space-y-6">
      <OrgsActiveKpis data={summary} isLoading={isLoading} />
      <OrgKpis data={summary} isLoading={isLoading} />
      <OrgsExplorer onSelect={handleSelect} />
    </div>
  );
}
