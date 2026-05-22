import type { Dataset } from "@gikiuk/facts-engine";
import { makeFactFormatter } from "@/lib/analytics/fact-formatter";
import type { FactBreakdown } from "@/lib/analytics/insights/insights-api";

export type NotableHighlight = {
  factKey: string;
  factLabel: string;
  valueLabel: string;
  cohortShare: number;
  baselineShare: number;
  delta: number;
};

function keyOf(v: string | number | boolean | null): string {
  return v === null ? "__null__" : String(v);
}

const MIN_ABS_DELTA = 0.05;
const MIN_ABS_SHARE = 0.02;

/**
 * Surfaces top (fact value, cohort vs baseline) pairs where the cohort skews most.
 * Computed client-side from already-fetched breakdowns — no extra request.
 */
export function buildNotableHighlights({
  cohort,
  baseline,
  dataset,
  maxItems
}: {
  cohort: FactBreakdown[];
  baseline: FactBreakdown[];
  dataset: Dataset | null;
  maxItems: number;
}): NotableHighlight[] {
  if (baseline.length === 0) return [];
  const baselineByKey = new Map(baseline.map((b) => [b.key, b]));
  const formatter = dataset ? makeFactFormatter(dataset.data) : null;
  const results: NotableHighlight[] = [];

  for (const breakdown of cohort) {
    const baselineMatch = baselineByKey.get(breakdown.key);
    if (!baselineMatch) continue;

    const question = dataset?.data.questions.find((q) => q.key === breakdown.key);
    const factKey = question?.fact ?? breakdown.key;
    const factLabel = question?.label ?? breakdown.key;
    const baselineShareByValue = new Map(baselineMatch.values.map((v) => [keyOf(v.value), v.share]));

    for (const v of breakdown.values) {
      if (v.value === null) continue;
      const baselineShare = baselineShareByValue.get(keyOf(v.value)) ?? 0;
      const delta = v.share - baselineShare;
      if (Math.abs(delta) < MIN_ABS_DELTA || v.share < MIN_ABS_SHARE) continue;
      results.push({
        factKey: breakdown.key,
        factLabel,
        valueLabel: formatter ? formatter(factKey, v.value).valueLabel : String(v.value),
        cohortShare: v.share,
        baselineShare,
        delta
      });
    }
  }

  return results.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, maxItems);
}
