"use client";

import { Building2 } from "lucide-react";
import { KpiCard } from "@/components/analytics/kpi-card";
import type { AnalyticsSummary } from "@/lib/analytics/api";

type OrgsActiveKpisProps = {
  data: AnalyticsSummary | null;
  isLoading: boolean;
};

export function OrgsActiveKpis({ data, isLoading }: OrgsActiveKpisProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        label="DAC"
        icon={Building2}
        value={data ? data.active_companies.dac : isLoading ? "…" : null}
        hint="Distinct companies active in the last 24h"
      />
      <KpiCard
        label="WAC"
        icon={Building2}
        value={data ? data.active_companies.wac : isLoading ? "…" : null}
        hint="Distinct companies active in the last 7 days"
      />
      <KpiCard
        label="MAC"
        icon={Building2}
        value={data ? data.active_companies.mac : isLoading ? "…" : null}
        hint="Distinct companies active in the last 30 days"
      />
    </div>
  );
}
