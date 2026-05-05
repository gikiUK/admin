"use client";

import { UsersActiveKpis } from "@/components/analytics/users-active-kpis";
import { UsersExplorer } from "@/components/analytics/users-explorer";
import type { AnalyticsSummary } from "@/lib/analytics/api";

type UsersTabProps = {
  summary: AnalyticsSummary | null;
  isLoading: boolean;
};

export function UsersTab({ summary, isLoading }: UsersTabProps) {
  return (
    <div className="space-y-6">
      <UsersActiveKpis data={summary} isLoading={isLoading} />
      <UsersExplorer />
    </div>
  );
}
