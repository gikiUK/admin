import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StatusDistributionProps = {
  distribution: Record<string, number>;
};

const STATUS_LABEL: Record<string, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
  archived: "Archived",
  rejected: "Rejected"
};

export function StatusDistribution({ distribution }: StatusDistributionProps) {
  const entries = Object.entries(distribution);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Status distribution</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {total === 0 ? (
          <div className="text-sm text-muted-foreground">No tracked actions yet.</div>
        ) : (
          entries.map(([status, count]) => {
            const pct = total === 0 ? 0 : (count / total) * 100;
            return (
              <div key={status} className="space-y-1">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-medium">{STATUS_LABEL[status] ?? status}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {count} · {pct.toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
