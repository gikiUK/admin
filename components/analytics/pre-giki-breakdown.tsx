import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PreGikiBreakdownProps = {
  breakdown: { already_doing: number; previously_done: number; none: number };
};

const SEGMENTS: Array<{ key: keyof PreGikiBreakdownProps["breakdown"]; label: string; color: string }> = [
  { key: "already_doing", label: "Already doing at onboarding", color: "bg-emerald-500" },
  { key: "previously_done", label: "Previously done at onboarding", color: "bg-sky-500" },
  { key: "none", label: "Earned in-app", color: "bg-primary" }
];

export function PreGikiBreakdown({ breakdown }: PreGikiBreakdownProps) {
  const total = SEGMENTS.reduce((sum, segment) => sum + breakdown[segment.key], 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Onboarding baseline vs organic progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {total === 0 ? (
          <div className="text-sm text-muted-foreground">No tracked actions yet.</div>
        ) : (
          <>
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
              {SEGMENTS.map((segment) => {
                const pct = total === 0 ? 0 : (breakdown[segment.key] / total) * 100;
                if (pct === 0) return null;
                return <div key={segment.key} className={`h-full ${segment.color}`} style={{ width: `${pct}%` }} />;
              })}
            </div>
            <div className="space-y-1.5">
              {SEGMENTS.map((segment) => {
                const value = breakdown[segment.key];
                const pct = total === 0 ? 0 : (value / total) * 100;
                return (
                  <div key={segment.key} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`size-2.5 rounded-sm ${segment.color}`} />
                      <span>{segment.label}</span>
                    </div>
                    <span className="tabular-nums text-muted-foreground">
                      {value} · {pct.toFixed(0)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
