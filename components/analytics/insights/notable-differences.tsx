"use client";

import { ArrowDown, ArrowUp, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FactBreakdown } from "@/lib/analytics/insights/insights-api";
import { useLiveDataset } from "@/lib/analytics/use-live-dataset";

type Props = {
  cohort: FactBreakdown[];
  baseline: FactBreakdown[];
  maxItems?: number;
};

type Highlight = {
  factKey: string;
  factLabel: string;
  valueLabel: string;
  cohortShare: number;
  baselineShare: number;
  delta: number;
};

/**
 * Surfaces the top N (fact value, cohort vs baseline) pairs where the cohort skews most.
 * Computed client-side from the already-fetched breakdowns; no extra request.
 */
export function NotableDifferences({ cohort, baseline, maxItems = 3 }: Props) {
  const { data: dataset } = useLiveDataset();

  const highlights = useMemo(() => {
    if (baseline.length === 0) return [];
    const baselineByKey = new Map(baseline.map((b) => [b.key, b]));
    const results: Highlight[] = [];

    for (const breakdown of cohort) {
      const baselineMatch = baselineByKey.get(breakdown.key);
      if (!baselineMatch) continue;

      const question = dataset?.data.questions.find((q) => q.key === breakdown.key);
      const optionPairs = question?.options?.length
        ? question.options
        : question?.options_ref
          ? (dataset?.data.constants[question.options_ref] ?? []).map((c) => ({
              value: c.name,
              label: c.label ?? c.name
            }))
          : [];
      const labelLookup = new Map(optionPairs.map((o) => [String(o.value), o.label]));
      const factLabel = question?.label ?? breakdown.key;

      const baselineShareByValue = new Map(baselineMatch.values.map((v) => [keyOf(v.value), v.share]));

      for (const v of breakdown.values) {
        if (v.value === null) continue;
        const baselineShare = baselineShareByValue.get(keyOf(v.value)) ?? 0;
        const delta = v.share - baselineShare;
        // Filter out tiny rounding noise and tiny absolute shares.
        if (Math.abs(delta) < 0.05 || v.share < 0.02) continue;
        results.push({
          factKey: breakdown.key,
          factLabel,
          valueLabel: labelLookup.get(String(v.value)) ?? String(v.value),
          cohortShare: v.share,
          baselineShare,
          delta
        });
      }
    }

    return results.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, maxItems);
  }, [cohort, baseline, dataset, maxItems]);

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
          {highlights.map((h) => {
            const up = h.delta > 0;
            return (
              <li key={`${h.factKey}:${h.valueLabel}`} className="rounded-md border bg-card p-3">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground truncate" title={h.factLabel}>
                  {h.factLabel}
                </div>
                <div className="mt-0.5 truncate text-sm font-medium" title={h.valueLabel}>
                  {h.valueLabel}
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span
                    className={`inline-flex items-center gap-0.5 text-base font-semibold tabular-nums ${
                      up ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {up ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />}
                    {Math.abs(h.delta * 100).toFixed(0)} pts
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {(h.cohortShare * 100).toFixed(0)}% vs {(h.baselineShare * 100).toFixed(0)}%
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

function keyOf(v: string | number | boolean | null): string {
  return v === null ? "__null__" : String(v);
}
