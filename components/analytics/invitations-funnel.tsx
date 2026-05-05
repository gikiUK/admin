import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPercent } from "@/lib/analytics/format";

type InvitationsFunnelProps = {
  funnel: {
    sent: number;
    accepted: number;
    declined: number;
    pending: number;
    acceptance_rate: number;
  };
};

const STEPS: Array<{ key: "accepted" | "declined" | "pending"; label: string; color: string }> = [
  { key: "accepted", label: "Accepted", color: "bg-emerald-500" },
  { key: "pending", label: "Pending", color: "bg-amber-500" },
  { key: "declined", label: "Declined", color: "bg-muted-foreground/40" }
];

export function InvitationsFunnel({ funnel }: InvitationsFunnelProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-baseline justify-between gap-2">
        <CardTitle className="text-base">Invitations</CardTitle>
        <span className="text-sm text-muted-foreground tabular-nums">
          {formatPercent(funnel.acceptance_rate)} accepted
        </span>
      </CardHeader>
      <CardContent className="space-y-3">
        {funnel.sent === 0 ? (
          <div className="text-sm text-muted-foreground">No invitations sent in range.</div>
        ) : (
          <>
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium">Sent</span>
              <span className="text-2xl font-semibold tabular-nums">{funnel.sent}</span>
            </div>
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
              {STEPS.map((step) => {
                const pct = (funnel[step.key] / funnel.sent) * 100;
                if (pct === 0) return null;
                return <div key={step.key} className={`h-full ${step.color}`} style={{ width: `${pct}%` }} />;
              })}
            </div>
            <div className="space-y-1.5">
              {STEPS.map((step) => {
                const value = funnel[step.key];
                const pct = (value / funnel.sent) * 100;
                return (
                  <div key={step.key} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`size-2.5 rounded-sm ${step.color}`} />
                      <span>{step.label}</span>
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
