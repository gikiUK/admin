import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type TierBreakdownProps = {
  tiers: { standard: number; premium: number };
};

const TIERS: Array<{ key: keyof TierBreakdownProps["tiers"]; label: string; color: string }> = [
  { key: "premium", label: "Premium", color: "bg-primary" },
  { key: "standard", label: "Standard", color: "bg-muted-foreground/40" }
];

export function TierBreakdown({ tiers }: TierBreakdownProps) {
  const total = tiers.standard + tiers.premium;
  const premiumPct = total === 0 ? 0 : (tiers.premium / total) * 100;

  return (
    <Card>
      <CardHeader className="flex flex-row items-baseline justify-between gap-2">
        <CardTitle className="text-base">Subscription tier</CardTitle>
        <span className="text-sm text-muted-foreground tabular-nums">{premiumPct.toFixed(0)}% premium</span>
      </CardHeader>
      <CardContent className="space-y-3">
        {total === 0 ? (
          <div className="text-sm text-muted-foreground">No companies yet.</div>
        ) : (
          TIERS.map((tier) => {
            const value = tiers[tier.key];
            const pct = total === 0 ? 0 : (value / total) * 100;
            return (
              <div key={tier.key} className="space-y-1">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-medium">{tier.label}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {value} · {pct.toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className={`h-full ${tier.color}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
