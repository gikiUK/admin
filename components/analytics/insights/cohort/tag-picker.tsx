"use client";

import { TagBadgeList } from "@/components/analytics/insights/cohort/tag-badge-list";
import { TagPickerPopover } from "@/components/analytics/insights/cohort/tag-picker-popover";
import { buildTagUniverse } from "@/components/analytics/insights/cohort/tag-picker-universe";
import { useTags } from "@/lib/tags/use-tags";

type Props = {
  legend: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
};

export function TagPicker({ legend, value, onChange, placeholder = "Pick tags" }: Props) {
  const state = useTags();
  const universe = buildTagUniverse(state, value);
  const triggerLabel = value.length === 0 ? placeholder : "Edit";

  function toggle(tag: string) {
    onChange(value.includes(tag) ? value.filter((t) => t !== tag) : [...value, tag]);
  }

  return (
    <div className="space-y-2">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{legend}</span>
      <div className="flex flex-wrap items-center gap-1.5">
        <TagBadgeList tags={value} onRemove={toggle} />
        <TagPickerPopover
          state={state}
          universe={universe}
          value={value}
          triggerLabel={triggerLabel}
          onToggle={toggle}
          onCreate={(tag) => onChange([...value, tag])}
        />
      </div>
    </div>
  );
}
