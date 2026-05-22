import { Card, CardContent } from "@/components/ui/card";

type Props = {
  label: string;
  value: string;
  sub?: string;
};

export function KpiCard({ label, value, sub }: Props) {
  return (
    <Card>
      <CardContent className="py-3">
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="mt-0.5 text-xl font-semibold tracking-tight tabular-nums">{value}</div>
        {sub && <div className="text-[11px] text-muted-foreground">{sub}</div>}
      </CardContent>
    </Card>
  );
}
