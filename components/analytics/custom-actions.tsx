import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CustomActionsProps = {
  custom: { total: number; orgs_with_custom_actions: number; avg_per_org: number };
};

export function CustomActions({ custom }: CustomActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Custom actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3 text-center">
          <Stat label="Total" value={custom.total} />
          <Stat label="Orgs using" value={custom.orgs_with_custom_actions} />
          <Stat label="Avg / org" value={custom.avg_per_org.toFixed(1)} />
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}
