"use client";

import { PlanStatusBarChart } from "@/components/analytics/insights/plan/plan-status-bar-chart";
import { buildPlanStatusRows } from "@/components/analytics/insights/plan/plan-status-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  byStatus: Record<string, number>;
};

export function PlanStatusChart({ byStatus }: Props) {
  const rows = buildPlanStatusRows(byStatus);
  const total = rows.reduce((acc, d) => acc + d.count, 0);

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Plan actions by status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">No plan actions in the cohort.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Plan actions by status</CardTitle>
        <p className="text-xs text-muted-foreground">{total.toLocaleString()} tracked actions</p>
      </CardHeader>
      <CardContent>
        <PlanStatusBarChart rows={rows} total={total} />
      </CardContent>
    </Card>
  );
}
