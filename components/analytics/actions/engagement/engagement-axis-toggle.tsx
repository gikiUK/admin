"use client";

import type { EngagementAxis } from "@/components/analytics/actions/engagement/engagement-types";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type Props = {
  value: EngagementAxis;
  onChange: (value: EngagementAxis) => void;
};

export function EngagementAxisToggle({ value, onChange }: Props) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(next) => next && onChange(next as EngagementAxis)}
      variant="outline"
      size="sm"
    >
      <ToggleGroupItem value="assignee_coverage">Assignee</ToggleGroupItem>
      <ToggleGroupItem value="due_date_coverage">Due date</ToggleGroupItem>
      <ToggleGroupItem value="notes_coverage">Notes</ToggleGroupItem>
    </ToggleGroup>
  );
}
