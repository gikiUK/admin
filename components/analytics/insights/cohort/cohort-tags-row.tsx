"use client";

import { TagPicker } from "@/components/analytics/insights/cohort/tag-picker";
import type { OrgFilters } from "@/lib/analytics/insights/cohort-spec";

type Props = {
  orgFilters: OrgFilters;
  onChange: (patch: Partial<OrgFilters>) => void;
};

export function CohortTagsRow({ orgFilters, onChange }: Props) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <TagPicker
        legend="Tags include (any-of)"
        value={orgFilters.tags_include ?? []}
        onChange={(next) => onChange({ tags_include: next })}
      />
      <TagPicker
        legend="Tags exclude (none-of)"
        value={orgFilters.tags_exclude ?? []}
        onChange={(next) => onChange({ tags_exclude: next })}
      />
    </div>
  );
}
