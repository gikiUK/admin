"use client";

import { TrendingUp } from "lucide-react";
import { NotableDifferenceCard } from "@/components/analytics/insights/facts/notable-difference-card";
import { buildNotableHighlights } from "@/components/analytics/insights/facts/notable-differences-builder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FactBreakdown } from "@/lib/analytics/insights/insights-api";
import { useLiveDataset } from "@/lib/analytics/use-live-dataset";

type Props = {
  cohort: FactBreakdown[];
  baseline: FactBreakdown[];
  maxItems?: number;
};

export function NotableDifferences({ cohort, baseline, maxItems = 3 }: Props) {
  const { data: dataset } = useLiveDataset();
  const highlights = buildNotableHighlights({ cohort, baseline, dataset, maxItems });

  if (highlights.length === 0) return null;

  return (
    <Card className="bg-primary/[0.03] border-primary/15">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-1.5 text-sm">
          <TrendingUp className="size-4 text-primary" />
          Where this cohort differs most
        </CardTitle>
        <p className="text-xs text-muted-foreground">Largest gaps between cohort share and the all-orgs baseline.</p>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-2 md:grid-cols-3">
          {highlights.map((h) => (
            <NotableDifferenceCard key={`${h.factKey}:${h.valueLabel}`} highlight={h} />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
