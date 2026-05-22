import { Card, CardContent } from "@/components/ui/card";

type Props = {
  label: string;
  value: string;
  sub?: string;
};

export function HeroKpiCard({ label, value, sub }: Props) {
  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="py-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-primary">{label}</div>
        <div className="mt-1 text-4xl font-bold tracking-tight tabular-nums">{value}</div>
        {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
      </CardContent>
    </Card>
  );
}
