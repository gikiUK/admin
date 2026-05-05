"use client";

import { Activity, UserPlus } from "lucide-react";
import { KpiCard } from "@/components/analytics/kpi-card";
import type { AnalyticsSummary } from "@/lib/analytics/api";

type UsersActiveKpisProps = {
  data: AnalyticsSummary | null;
  isLoading: boolean;
};

export function UsersActiveKpis({ data, isLoading }: UsersActiveKpisProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        label="DAU"
        icon={Activity}
        value={data ? data.active_users.dau : isLoading ? "…" : null}
        hint="Distinct users with any event in the last 24h"
      />
      <KpiCard
        label="WAU"
        icon={Activity}
        value={data ? data.active_users.wau : isLoading ? "…" : null}
        hint="Distinct users with any event in the last 7 days"
      />
      <KpiCard
        label="MAU"
        icon={Activity}
        value={data ? data.active_users.mau : isLoading ? "…" : null}
        hint="Distinct users with any event in the last 30 days"
      />
      <KpiCard
        label="New signups"
        icon={UserPlus}
        value={data ? data.new_signups : isLoading ? "…" : null}
        hint="Users who signed up in range"
      />
    </div>
  );
}
