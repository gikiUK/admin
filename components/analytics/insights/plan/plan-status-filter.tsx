"use client";

import { MultiCheckGroup } from "@/components/analytics/insights/shared/multi-check-group";

const STATUS_OPTIONS = [
  { value: "not_started", label: "Not started" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
  { value: "rejected", label: "Rejected" }
];

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
};

export function PlanStatusFilter({ value, onChange }: Props) {
  return <MultiCheckGroup legend="Status" options={STATUS_OPTIONS} value={value} onChange={onChange} />;
}
