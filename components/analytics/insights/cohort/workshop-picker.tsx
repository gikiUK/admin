"use client";

import { useWorkshopList } from "@/components/analytics/insights/cohort/use-workshop-list";
import { WorkshopBadges } from "@/components/analytics/insights/cohort/workshop-badges";
import { WorkshopPickerPopover } from "@/components/analytics/insights/cohort/workshop-picker-popover";

type Props = {
  selectedUuids: string[];
  onChange: (next: string[]) => void;
};

export function WorkshopPicker({ selectedUuids, onChange }: Props) {
  const { workshops, totalCount } = useWorkshopList();
  const selectedWorkshops = workshops?.filter((w) => selectedUuids.includes(w.uuid)) ?? [];

  function toggle(uuid: string) {
    onChange(selectedUuids.includes(uuid) ? selectedUuids.filter((u) => u !== uuid) : [...selectedUuids, uuid]);
  }

  return (
    <div className="space-y-2">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Workshops</span>
      <div className="flex flex-wrap gap-1.5">
        <WorkshopBadges workshops={selectedWorkshops} onRemove={toggle} />
        <WorkshopPickerPopover
          workshops={workshops}
          totalCount={totalCount}
          selectedUuids={selectedUuids}
          triggerLabel={selectedWorkshops.length === 0 ? "Pick workshops" : "Edit"}
          onToggle={toggle}
        />
      </div>
    </div>
  );
}
