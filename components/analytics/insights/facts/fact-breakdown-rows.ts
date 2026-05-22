import type { FactBreakdown, FactBreakdownValue } from "@/lib/analytics/insights/insights-api";

export type FactBreakdownPairedRow = {
  key: string;
  label: string;
  value: FactBreakdownValue["value"];
  cohortShare: number;
  baselineShare: number;
  cohortCount: number;
  baselineCount: number;
  delta: number;
  isActive: boolean;
};

function keyForValue(value: FactBreakdownValue["value"]): string {
  return value === null ? "__null__" : String(value);
}

type Params = {
  breakdown: FactBreakdown;
  baseline?: FactBreakdown;
  activeValues: Set<string>;
  labelFor: (v: FactBreakdownValue["value"]) => string;
};

export function buildFactBreakdownRows({
  breakdown,
  baseline,
  activeValues,
  labelFor
}: Params): FactBreakdownPairedRow[] {
  if (baseline) {
    const baselineByValue = new Map(baseline.values.map((v) => [keyForValue(v.value), v]));
    const allKeys = new Set<string>();
    for (const v of breakdown.values) if (v.value !== null) allKeys.add(keyForValue(v.value));
    for (const v of baseline.values) if (v.value !== null) allKeys.add(keyForValue(v.value));

    return Array.from(allKeys)
      .map((k) => {
        const cohortV = breakdown.values.find((x) => keyForValue(x.value) === k);
        const baselineV = baselineByValue.get(k);
        const value = (cohortV?.value ?? baselineV?.value) as FactBreakdownValue["value"];
        const cohortShare = cohortV?.share ?? 0;
        const baselineShare = baselineV?.share ?? 0;
        return {
          key: k,
          label: labelFor(value),
          value,
          cohortShare,
          baselineShare,
          cohortCount: cohortV?.count ?? 0,
          baselineCount: baselineV?.count ?? 0,
          delta: (cohortShare - baselineShare) * 100,
          isActive: value !== null && activeValues.has(String(value))
        };
      })
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  }

  return breakdown.values
    .filter((v) => v.value !== null)
    .map((v) => ({
      key: keyForValue(v.value),
      label: labelFor(v.value),
      value: v.value,
      cohortShare: v.share,
      baselineShare: 0,
      cohortCount: v.count,
      baselineCount: 0,
      delta: 0,
      isActive: v.value !== null && activeValues.has(String(v.value))
    }))
    .sort((a, b) => b.cohortShare - a.cohortShare);
}
