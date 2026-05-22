"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ACTION_KINDS, type ActionKind } from "@/lib/analytics/actions-api";

const KIND_LABELS: Record<ActionKind, string> = {
  both: "System + custom",
  system: "System actions",
  custom: "Custom actions"
};

type Props = {
  value: ActionKind;
  onChange: (value: ActionKind) => void;
};

export function ActionKindSelect({ value, onChange }: Props) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next as ActionKind)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ACTION_KINDS.map((kind) => (
          <SelectItem key={kind} value={kind}>
            {KIND_LABELS[kind]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
