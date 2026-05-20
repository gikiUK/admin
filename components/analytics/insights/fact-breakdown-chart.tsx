"use client";

import { X } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { makeFactFormatter } from "@/lib/analytics/fact-formatter";
import { useCohort } from "@/lib/analytics/insights/cohort-context";
import type { FactBreakdown, FactBreakdownValue } from "@/lib/analytics/insights/insights-api";
import { useLiveDataset } from "@/lib/analytics/use-live-dataset";
import { cn } from "@/lib/utils";

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
              <PairedRow
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

function PairedRow({
  label,
  cohortShare,
  baselineShare,
  cohortCount,
  baselineCount,
  showBaseline,
  isActive,
  clickable,
  onClick
}: {
  label: string;
  cohortShare: number;
  baselineShare: number;
  cohortCount: number;
  baselineCount: number;
  showBaseline: boolean;
  isActive: boolean;
  clickable: boolean;
  onClick: () => void;
}) {
  const delta = (cohortShare - baselineShare) * 100;
  const deltaLabel =
    showBaseline && Math.abs(delta) >= 1 ? `${delta > 0 ? "+" : "−"}${Math.abs(delta).toFixed(0)} pts` : "";
  const deltaTone = delta > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400";

  const content = (
    <div
      className={cn(
        "rounded-md px-2.5 py-2 transition-colors",
        clickable && "cursor-pointer hover:bg-muted/50",
        isActive && "bg-primary/5 ring-1 ring-primary/30"
      )}
    >
      <div className="flex items-baseline justify-between gap-3 text-xs">
        <span className="truncate font-medium text-foreground" title={label}>
          {label}
        </span>
        <span className="flex shrink-0 items-baseline gap-2 tabular-nums">
          <span className="text-foreground">
            {cohortCount}
            <span className="text-muted-foreground"> ({(cohortShare * 100).toFixed(0)}%)</span>
          </span>
          {showBaseline && deltaLabel && <span className={cn("text-[11px] font-medium", deltaTone)}>{deltaLabel}</span>}
        </span>
      </div>
      <div className="mt-1.5 space-y-1">
        <FillBar share={cohortShare} tone="cohort" />
        {showBaseline && <FillBar share={baselineShare} tone="baseline" count={baselineCount} />}
      </div>
    </div>
  );

  if (!clickable) return content;
  return (
    <button type="button" onClick={onClick} className="block w-full text-left">
      {content}
    </button>
  );
}

function FillBar({ share, tone, count }: { share: number; tone: "cohort" | "baseline"; count?: number }) {
  const widthPercent = Math.max(share * 100, share > 0 ? 1 : 0); // floor at 1% so tiny non-zero shares still show
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn("h-2 flex-1 overflow-hidden rounded-full", tone === "cohort" ? "bg-primary/10" : "bg-muted")}
        aria-hidden
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width]",
            tone === "cohort" ? "bg-primary" : "bg-muted-foreground/40"
          )}
          style={{ width: `${widthPercent}%` }}
        />
      </div>
      {tone === "baseline" && (
        <span className="w-16 shrink-0 text-right text-[10px] uppercase tracking-wide tabular-nums text-muted-foreground">
          baseline {(share * 100).toFixed(0)}%{count !== undefined && count > 0 && ` (${count})`}
        </span>
      )}
      {tone === "cohort" && (
        <span className="w-16 shrink-0 text-right text-[10px] uppercase tracking-wide tabular-nums text-primary/70">
          cohort
        </span>
      )}
    </div>
  );
}

function keyForValue(value: FactBreakdownValue["value"]): string {
  return value === null ? "__null__" : String(value);
}
