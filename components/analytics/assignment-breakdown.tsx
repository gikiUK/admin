import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AssignmentBreakdownProps = {
  breakdown: {
    total: number;
    assigned: number;
    unassigned: number;
    with_due_date: number;
  };
};

export function AssignmentBreakdown({ breakdown }: AssignmentBreakdownProps) {
  const { total, assigned, unassigned, with_due_date } = breakdown;
  const rows = [
    { label: "Assigned", value: assigned, total, color: "bg-primary" },
    { label: "Unassigned", value: unassigned, total, color: "bg-muted-foreground/40" },
    { label: "With due date", value: with_due_date, total, color: "bg-sky-500" }
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-baseline justify-between gap-2">
        <CardTitle className="text-base">Action assignment</CardTitle>
        <span className="text-sm text-muted-foreground tabular-nums">{total} actions</span>
      </CardHeader>
      <CardContent className="space-y-3">
        {total === 0 ? (
          <div className="text-sm text-muted-foreground">No tracked actions yet.</div>
        ) : (
          rows.map((row) => {
            const pct = (row.value / row.total) * 100;
            return (
              <div key={row.label} className="space-y-1">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-medium">{row.label}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {row.value} · {pct.toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className={`h-full ${row.color}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
