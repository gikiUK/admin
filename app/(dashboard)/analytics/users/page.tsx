"use client";

import { SummaryGate } from "@/components/analytics/summary-gate";
import { UsersTab } from "@/components/analytics/users-tab";
import { PageHeader } from "@/components/page-header";
import { useSummaryContext } from "@/lib/analytics/summary-context";

export default function AnalyticsUsersPage() {
  const summary = useSummaryContext();
  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Activity and signups across users" />
      <SummaryGate loadingLabel="Loading users…">
        {(data) => <UsersTab summary={data} isLoading={summary.status === "loading"} />}
      </SummaryGate>
    </div>
  );
}
