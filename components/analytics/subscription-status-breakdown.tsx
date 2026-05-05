import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SubscriptionStatusBreakdownProps = {
  statuses: Record<string, number>;
};

const STATUS_ORDER = [
  "never_subscribed",
  "incomplete",
  "active",
  "payment_failed",
  "cancelling",
  "canceled",
  "incomplete_expired"
] as const;

const STATUS_LABEL: Record<string, string> = {
  never_subscribed: "Never subscribed",
  incomplete: "Incomplete",
  active: "Active",
  payment_failed: "Payment failed",
  cancelling: "Cancelling",
  canceled: "Cancelled",
  incomplete_expired: "Expired"
};

export function SubscriptionStatusBreakdown({ statuses }: SubscriptionStatusBreakdownProps) {
  const max = Math.max(...Object.values(statuses), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Subscription statuses</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {STATUS_ORDER.map((status) => {
          const value = statuses[status] ?? 0;
          const pct = (value / max) * 100;
          return (
            <div key={status} className="grid grid-cols-[140px_1fr_3rem] items-center gap-3 text-sm">
              <span className="truncate text-muted-foreground">{STATUS_LABEL[status]}</span>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary/60" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-right tabular-nums">{value}</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
