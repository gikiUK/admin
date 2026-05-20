"use client";

import { Plus, RotateCcw } from "lucide-react";
import { Fragment, useState } from "react";
import { FactFilterRow } from "@/components/analytics/insights/fact-filter-row";
import { MultiCheckGroup } from "@/components/analytics/insights/multi-check-group";
import { TagPicker } from "@/components/analytics/insights/tag-picker";
import { WorkshopPicker } from "@/components/analytics/insights/workshop-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useCohort } from "@/lib/analytics/insights/cohort-context";
import type { FactFilter, OrgFilters } from "@/lib/analytics/insights/cohort-spec";
import { useLiveDataset } from "@/lib/analytics/use-live-dataset";

type Props = {
  /** When embedded inside a Sheet/Dialog, skip the outer Card chrome and the collapse toggle. */
  embedded?: boolean;
};

const TIER_OPTIONS = [
  { value: "standard", label: "Standard" },
  { value: "premium", label: "Premium" }
];

const STATUS_OPTIONS = [
  { value: "never_subscribed", label: "Never subscribed" },
  { value: "incomplete", label: "Incomplete" },
  { value: "active", label: "Active" },
  { value: "payment_failed", label: "Payment failed" },
  { value: "cancelling", label: "Cancelling" },
  { value: "canceled", label: "Canceled" },
  { value: "incomplete_expired", label: "Incomplete expired" }
];

export function CohortBuilder({ embedded = false }: Props = {}) {
  const { spec, setSpec, reset } = useCohort();
  const { data: dataset } = useLiveDataset();
  const [collapsed, setCollapsed] = useState(false);

  function updateOrg(patch: Partial<OrgFilters>) {
    setSpec({ ...spec, org_filters: { ...spec.org_filters, ...patch } });
  }

  function updateFactFilters(next: FactFilter[]) {
    setSpec({ ...spec, fact_filters: next });
  }

  function addFactFilter() {
    updateFactFilters([...spec.fact_filters, { key: "", values: [] }]);
  }

  const trackedActionsValue =
    spec.org_filters.has_tracked_actions === true
      ? "yes"
      : spec.org_filters.has_tracked_actions === false
        ? "no"
        : "any";

  function setTrackedActions(value: string) {
    if (value === "yes") updateOrg({ has_tracked_actions: true });
    else if (value === "no") updateOrg({ has_tracked_actions: false });
    else updateOrg({ has_tracked_actions: undefined });
  }

  const body = (
    <Fragment>
      <div className="grid gap-5 md:grid-cols-2">
        <MultiCheckGroup
          legend="Tier"
          options={TIER_OPTIONS}
          value={spec.org_filters.tier ?? []}
          onChange={(next) => updateOrg({ tier: next as ("standard" | "premium")[] })}
        />
        <MultiCheckGroup
          legend="Subscription status"
          options={STATUS_OPTIONS}
          value={spec.org_filters.subscription_status ?? []}
          onChange={(next) => updateOrg({ subscription_status: next })}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <TagPicker
          legend="Tags include (any-of)"
          value={spec.org_filters.tags_include ?? []}
          onChange={(next) => updateOrg({ tags_include: next })}
        />
        <TagPicker
          legend="Tags exclude (none-of)"
          value={spec.org_filters.tags_exclude ?? []}
          onChange={(next) => updateOrg({ tags_exclude: next })}
        />
      </div>

      <WorkshopPicker
        selectedUuids={spec.org_filters.workshop_uuids ?? []}
        onChange={(next) => updateOrg({ workshop_uuids: next })}
      />

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Signed up</span>
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-1">
              <Label className="text-xs">From</Label>
              <Input
                type="date"
                value={spec.org_filters.signed_up_from?.slice(0, 10) ?? ""}
                onChange={(e) => updateOrg({ signed_up_from: e.target.value || undefined })}
                className="h-8 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs">To</Label>
              <Input
                type="date"
                value={spec.org_filters.signed_up_to?.slice(0, 10) ?? ""}
                onChange={(e) => updateOrg({ signed_up_to: e.target.value || undefined })}
                className="h-8 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Has tracked actions</span>
          <ToggleGroup
            type="single"
            value={trackedActionsValue}
            onValueChange={(v) => v && setTrackedActions(v)}
            variant="outline"
            size="sm"
          >
            <ToggleGroupItem value="any">Any</ToggleGroupItem>
            <ToggleGroupItem value="yes">With actions</ToggleGroupItem>
            <ToggleGroupItem value="no">Without</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Fact filters (AND)</span>
          <Button variant="outline" size="sm" onClick={addFactFilter}>
            <Plus className="size-3" />
            Add fact filter
          </Button>
        </div>
        {spec.fact_filters.length === 0 ? (
          <p className="text-xs text-muted-foreground">No fact filters. Cohort defined by org filters only.</p>
        ) : (
          <div className="space-y-2">
            {spec.fact_filters.map((filter, i) => (
              <FactFilterRow
                // biome-ignore lint/suspicious/noArrayIndexKey: positional fact filters, no stable id
                key={i}
                filter={filter}
                dataset={dataset}
                onChange={(next) => {
                  const copy = [...spec.fact_filters];
                  copy[i] = next;
                  updateFactFilters(copy);
                }}
                onRemove={() => updateFactFilters(spec.fact_filters.filter((_, idx) => idx !== i))}
              />
            ))}
          </div>
        )}
      </div>
    </Fragment>
  );

  if (embedded) {
    return <div className="space-y-5 pt-2">{body}</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="text-sm font-semibold tracking-tight hover:underline"
            onClick={() => setCollapsed((c) => !c)}
          >
            Cohort
          </button>
          <span className="text-xs text-muted-foreground">
            {collapsed ? "click to expand" : "filters apply to both Facts and Plan insights"}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={reset}>
          <RotateCcw className="size-3.5" />
          Reset
        </Button>
      </CardHeader>
      {!collapsed && <CardContent className="space-y-5">{body}</CardContent>}
    </Card>
  );
}
