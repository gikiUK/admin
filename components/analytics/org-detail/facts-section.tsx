import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OrgFact } from "@/lib/analytics/api";
import { type FactFormatter, makeFactFormatter } from "@/lib/analytics/fact-formatter";
import { useLiveDataset } from "@/lib/analytics/use-live-dataset";
import { FactsByCategory } from "./facts-by-category";
import { FactsRawList } from "./facts-raw-list";

export function FactsSection({ facts }: { facts: OrgFact[] }) {
  const { data: dataset, loading: datasetLoading } = useLiveDataset();
  const formatter = useMemo<FactFormatter | null>(() => (dataset ? makeFactFormatter(dataset.data) : null), [dataset]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Facts ({facts.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {facts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No facts derived for this organisation yet.</p>
        ) : formatter ? (
          <FactsByCategory facts={facts} formatter={formatter} />
        ) : (
          <FactsRawList facts={facts} loading={datasetLoading} />
        )}
      </CardContent>
    </Card>
  );
}
