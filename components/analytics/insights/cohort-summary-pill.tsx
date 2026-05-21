"use client";

import type { Dataset } from "@gikiuk/facts-engine";
import { Pencil, RotateCcw, Users } from "lucide-react";
import { useState } from "react";
import { CohortBuilder } from "@/components/analytics/insights/cohort-builder";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { makeFactFormatter } from "@/lib/analytics/fact-formatter";
import { useCohort } from "@/lib/analytics/insights/cohort-context";
import { isEmptySpec } from "@/lib/analytics/insights/cohort-spec";
import { useLiveDataset } from "@/lib/analytics/use-live-dataset";

const TIER_LABELS: Record<string, string> = {
  standard: "Standard",
  premium: "Premium"
};

const STATUS_LABELS: Record<string, string> = {
  never_subscribed: "Never subscribed",
  incomplete: "Incomplete",
  active: "Active",
  payment_failed: "Payment failed",
  cancelling: "Cancelling",
  canceled: "Canceled",
  incomplete_expired: "Incomplete expired"
};

type Props = {
  cohortSize?: number;
  totalOrgs?: number;
};

export function CohortSummaryPill({ cohortSize, totalOrgs }: Props) {
  const { spec, reset } = useCohort();
  const { data: dataset } = useLiveDataset();
  const [open, setOpen] = useState(false);

  const chips = buildChips(spec, dataset);
  const empty = isEmptySpec(spec);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border bg-card px-3 py-2">
      <div className="flex items-center gap-2 pr-2 border-r">
        <Users className="size-4 text-muted-foreground" />
        <div className="leading-tight">
          <div className="text-sm font-semibold tabular-nums">
            {cohortSize === undefined ? "—" : cohortSize.toLocaleString()}
          </div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {totalOrgs && cohortSize !== undefined
              ? `${((cohortSize / Math.max(totalOrgs, 1)) * 100).toFixed(1)}% of all orgs`
              : "orgs in cohort"}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-wrap items-center gap-1.5">
        {empty ? (
          <span className="text-xs text-muted-foreground">All orgs (no filters)</span>
        ) : (
          chips.map((chip) => (
            <Badge key={chip.id} variant="secondary" className="text-[11px] font-normal">
              <span className="text-muted-foreground">{chip.label}:</span>
              <span className="ml-1">{chip.value}</span>
            </Badge>
          ))
        )}
      </div>

      <div className="flex items-center gap-1">
        {!empty && (
          <Button variant="ghost" size="sm" onClick={reset} className="h-7 text-xs">
            <RotateCcw className="size-3" />
            Reset
          </Button>
        )}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 text-xs">
              <Pencil className="size-3" />
              Edit cohort
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Edit cohort</SheetTitle>
            </SheetHeader>
            <div className="px-4 pb-6">
              <CohortBuilder embedded />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

type Chip = { id: string; label: string; value: string };

function buildChips(spec: ReturnType<typeof useCohort>["spec"], dataset: Dataset | null): Chip[] {
  const chips: Chip[] = [];
  const o = spec.org_filters;

  if (o.tier?.length) {
    chips.push({ id: "tier", label: "Tier", value: o.tier.map((t) => TIER_LABELS[t] ?? t).join(", ") });
  }
  if (o.subscription_status?.length) {
    chips.push({
      id: "status",
      label: "Status",
      value: o.subscription_status.map((s) => STATUS_LABELS[s] ?? s).join(", ")
    });
  }
  if (o.tags_include?.length) {
    chips.push({ id: "tags_in", label: "Tags incl.", value: o.tags_include.join(", ") });
  }
  if (o.tags_exclude?.length) {
    chips.push({ id: "tags_ex", label: "Tags excl.", value: o.tags_exclude.join(", ") });
  }
  if (o.workshop_uuids?.length) {
    chips.push({
      id: "workshops",
      label: "Workshops",
      value: `${o.workshop_uuids.length} selected`
    });
  }
  if (o.signed_up_from || o.signed_up_to) {
    const from = o.signed_up_from?.slice(0, 10) ?? "…";
    const to = o.signed_up_to?.slice(0, 10) ?? "…";
    chips.push({ id: "signup", label: "Signed up", value: `${from} → ${to}` });
  }
  if (o.has_tracked_actions === true) {
    chips.push({ id: "tracked", label: "Tracked actions", value: "Yes" });
  } else if (o.has_tracked_actions === false) {
    chips.push({ id: "tracked", label: "Tracked actions", value: "No" });
  }

  const formatter = dataset ? makeFactFormatter(dataset.data) : null;
  for (const f of spec.fact_filters) {
    if (!f.key || f.values.length === 0) continue;
    const q = dataset?.data.questions.find((qq) => qq.key === f.key);
    const factKey = q?.fact ?? f.key;
    const valueLabels = f.values.map((v) => (formatter ? formatter(factKey, v).valueLabel : String(v)));
    chips.push({
      id: `fact:${f.key}`,
      label: q?.label ?? f.key,
      value: valueLabels.join(" or ")
    });
  }

  return chips;
}
