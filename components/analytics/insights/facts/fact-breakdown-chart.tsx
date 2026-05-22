"use client";

import { buildFactBreakdownContext } from "@/components/analytics/insights/facts/fact-breakdown-context";
import { FactBreakdownPairedRow } from "@/components/analytics/insights/facts/fact-breakdown-paired-row";
import { buildFactBreakdownRows } from "@/components/analytics/insights/facts/fact-breakdown-rows";
import { BreakdownCardHeader } from "@/components/analytics/insights/shared/breakdown-card-header";
import { Card, CardContent } from "@/components/ui/card";
import { useCohort } from "@/lib/analytics/insights/cohort-context";
import { newFactFilterId } from "@/lib/analytics/insights/cohort-spec";
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
  const activeValues = new Set((activeFilter?.values ?? []).map(String));
  const { title, labelFor, clickable } = buildFactBreakdownContext(dataset, breakdown.key);
  const rows = buildFactBreakdownRows({ breakdown, baseline, activeValues, labelFor });

  const unansweredCount = breakdown.values.find((v) => v.value === null)?.count ?? 0;
  const cohortAnsweredTotal = breakdown.values.reduce((acc, v) => (v.value === null ? acc : acc + v.count), 0);

  function onValueClick(value: FactBreakdownValue["value"]) {
    if (!clickable || value === null) return;
    const v = value as string | number | boolean;
    const others = spec.fact_filters.filter((f) => f.key !== breakdown.key);
    const existing = spec.fact_filters.find((f) => f.key === breakdown.key);
    const currentValues = existing?.values ?? [];
    const isSelected = currentValues.some((cv) => String(cv) === String(v));
    const nextValues = isSelected ? currentValues.filter((cv) => String(cv) !== String(v)) : [...currentValues, v];
    const nextFilters =
      nextValues.length === 0
        ? others
        : [...others, { id: existing?.id ?? newFactFilterId(), key: breakdown.key, values: nextValues }];
    setSpec({ ...spec, fact_filters: nextFilters });
  }

  const description = (
    <>
      {breakdown.key}
      {baseline && " · cohort vs all-orgs baseline"}
      {breakdown.note && ` · ${breakdown.note}`}
    </>
  );

  return (
    <Card>
      <BreakdownCardHeader title={title} description={description} onRemove={onRemove} />
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
