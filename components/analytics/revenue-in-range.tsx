import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatGbp } from "@/lib/analytics/format";

type RevenueInRangeProps = {
  revenue: {
    total_amount_in_cents: number;
    payments_count: number;
    by_tier: Array<{ tier: string; amount_in_cents: number; payments_count: number }>;
  };
};

const TIER_LABEL: Record<string, string> = {
  premium: "Premium",
  standard: "Standard"
};

export function RevenueInRange({ revenue }: RevenueInRangeProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-baseline justify-between gap-2">
        <CardTitle className="text-base">Revenue in range</CardTitle>
        <span className="text-sm text-muted-foreground tabular-nums">{revenue.payments_count} payments</span>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-3xl font-semibold tracking-tight tabular-nums">
          {formatGbp(revenue.total_amount_in_cents)}
        </div>
        {revenue.by_tier.length === 0 ? (
          <div className="text-sm text-muted-foreground">No payments in range.</div>
        ) : (
          <div className="space-y-2">
            {revenue.by_tier.map((row) => (
              <div key={row.tier} className="flex items-baseline justify-between text-sm">
                <span className="font-medium">{TIER_LABEL[row.tier] ?? row.tier}</span>
                <span className="text-muted-foreground tabular-nums">
                  {formatGbp(row.amount_in_cents)} · {row.payments_count}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
