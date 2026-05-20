"use client";

import { X } from "lucide-react";
import { useMemo } from "react";
import { FactBreakdownPairedRow } from "@/components/analytics/insights/fact-breakdown-row";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { makeFactFormatter } from "@/lib/analytics/fact-formatter";
import { useCohort } from "@/lib/analytics/insights/cohort-context";
import type { FactBreakdown, FactBreakdownValue } from "@/lib/analytics/insights/insights-api";
import { useLiveDataset } from "@/lib/analytics/use-live-dataset";

type Props = {
  breakdown: FactBreakdown;
  baseline?: FactBreakdown;
  onRemove?: () => void;
};

export function FactBreakdownChart({ breakdown, baseline, onRemove }: Props) {
  const { data: dataset } = useLiveDataset();
  const { spec, setSpec } = useCohort();

  const activeFilter = spec.fact_filters.find((f) => f.key === breakdown.key);
  const activeValues = useMemo(() => new Set((activeFilter?.values ?? []).map(String)), [activeFilter]);

  const { title, labelFor, clickable } = useMemo(() => {
    if (!dataset) {
      return {
        title: breakdown.key,
        labelFor: (v: FactBreakdownValue["value"]) => (v === null ? "(unanswered)" : String(v)),
        clickable: false
      };
    }
    // breakdown.key matches question.key in the insights API. Find the question to get the
    // pretty title; pass the question's fact key to the formatter so constant IDs resolve.
    const question = dataset.data.questions.find((q) => q.key === breakdown.key);
    const factKey = question?.fact ?? breakdown.key;
    const formatter = makeFactFormatter(dataset.data);
    return {
      title: question?.label ?? formatter(factKey, null).label,
      labelFor: (v: FactBreakdownValue["value"]) => {
        if (v === null) return "(unanswered)";
        return formatter(factKey, v).valueLabel;
      },
      clickable: !!question
    };
  }, [dataset, breakdown.key]);

  const unansweredCount = useMemo(() => breakdown.values.find((v) => v.value === null)?.count ?? 0, [breakdown.values]);
  const cohortAnsweredTotal = useMemo(
    () => breakdown.values.reduce((acc, v) => (v.value === null ? acc : acc + v.count), 0),
    [breakdown.values]
  );

  function onValueClick(value: FactBreakdownValue["value"]) {
    if (!clickable || value === null) return;
    const v = value as string | number | boolean;
    const others = spec.fact_filters.filter((f) => f.key !== breakdown.key);
    const existing = spec.fact_filters.find((f) => f.key === breakdown.key);
    const currentValues = existing?.values ?? [];
    const isSelected = currentValues.some((cv) => String(cv) === String(v));
    const nextValues = isSelected ? currentValues.filter((cv) => String(cv) !== String(v)) : [...currentValues, v];
    const nextFilters = nextValues.length === 0 ? others : [...others, { key: breakdown.key, values: nextValues }];
    setSpec({ ...spec, fact_filters: nextFilters });
  }

  const rows = useMemo(() => {
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
    // No baseline: just the raw values sorted by share.
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
  }, [breakdown, baseline, labelFor, activeValues]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <div>
          <CardTitle className="text-sm">{title}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {breakdown.key}
            {baseline && " · cohort vs all-orgs baseline"}
            {breakdown.note && ` · ${breakdown.note}`}
          </p>
        </div>
        {onRemove && (
          <Button variant="ghost" size="icon" onClick={onRemove} aria-label="Remove" className="size-7">
            <X className="size-3.5" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <div className="text-xs text-muted-foreground">No comparable values.</div>
        ) : (
          <div className="space-y-3">
            {rows.map((row) => (
              <FactBreakdownPairedRow
                key={row.key}
                label={row.label}
                cohortShare={row.cohortShare}
                baselineShare={row.baselineShare}
                cohortCount={row.cohortCount}
                baselineCount={row.baselineCount}
                showBaseline={!!baseline}
                isActive={row.isActive}
                clickable={clickable}
                onClick={() => onValueClick(row.value)}
              />
            ))}
          </div>
        )}
        <p className="mt-3 text-[11px] text-muted-foreground">
          {cohortAnsweredTotal} answered · {unansweredCount} unanswered (of {cohortAnsweredTotal + unansweredCount}{" "}
          cohort orgs)
          {clickable && " · click a row to filter"}
        </p>
      </CardContent>
    </Card>
  );
}

function keyForValue(value: FactBreakdownValue["value"]): string {
  return value === null ? "__null__" : String(value);
}
