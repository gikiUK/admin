"use client";

import { Card, CardContent } from "@/components/ui/card";

type Props = {
  label: string;
  value: string;
};

export function KpiCard({ label, value }: Props) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
      </CardContent>
    </Card>
  );
}
