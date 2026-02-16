"use client";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { BlobConstantValue } from "@/lib/blob/types";
import { useDataset } from "@/lib/blob/use-dataset";

function ValuePill({ value }: { value: BlobConstantValue }) {
  return (
    <Badge variant={value.enabled ? "secondary" : "outline"} className={!value.enabled ? "opacity-50" : undefined}>
      <span className="mr-1 text-muted-foreground">{value.id}.</span>
      {value.label ?? value.name}
    </Badge>
  );
}

function ConstantGroupCard({ groupKey, values }: { groupKey: string; values: BlobConstantValue[] }) {
  const enabledCount = values.filter((v) => v.enabled).length;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2">
        <div>
          <h3 className="font-mono text-sm font-semibold">{groupKey}</h3>
          <p className="text-xs text-muted-foreground">
            {enabledCount} of {values.length} values enabled
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <ValuePill key={value.id} value={value} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ConstantsPage() {
  const { blob, loading } = useDataset();

  if (loading || !blob) {
    return <div className="p-6 text-muted-foreground">Loading constants...</div>;
  }

  const groups = Object.entries(blob.constants);

  return (
    <div className="space-y-6">
      <PageHeader title="Constants" description="Shared enums referenced across facts, questions, and actions." />

      <div className="space-y-4">
        {groups.map(([key, values]) => (
          <ConstantGroupCard key={key} groupKey={key} values={values} />
        ))}
      </div>
    </div>
  );
}
