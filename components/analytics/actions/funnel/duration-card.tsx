"use client";

import { DurationHistogram } from "@/components/analytics/actions/funnel/duration-histogram";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FunnelDurationStats } from "@/lib/analytics/actions-api";

type Props = {
  title: string;
  stats: FunnelDurationStats;
};

export function DurationCard({ title, stats }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
        <p className="text-xs text-muted-foreground">
          {stats.n.toLocaleString()} samples
          {stats.median_days !== null && ` · median ${stats.median_days.toFixed(1)}d`}
          {stats.p90_days !== null && ` · P90 ${stats.p90_days.toFixed(1)}d`}
        </p>
      </CardHeader>
      <CardContent>
        {stats.n === 0 ? (
          <div className="text-xs text-muted-foreground">No samples.</div>
        ) : (
          <DurationHistogram stats={stats} />
        )}
      </CardContent>
    </Card>
  );
}
