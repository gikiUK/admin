"use client";

import { Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type AddFactSelectProps = {
  label: string;
  factIds: string[];
  onAdd: (factId: string) => void;
};

export function AddFactSelect({ label, factIds, onAdd }: AddFactSelectProps) {
  if (factIds.length === 0) return null;

  const trigger = (
    <span className="flex items-center gap-1.5 text-foreground">
      <Plus className="size-3" />
      {label}
    </span>
  );

  return (
    /* Controlled empty value so picking the same fact twice in a row still fires onValueChange. */
    <Select value="" onValueChange={onAdd}>
      <SelectTrigger size="sm" className="w-[230px] text-xs">
        {/* Fixed label as both placeholder and children so the trigger always shows the label,
            while still registering Radix's value node (required for item-aligned positioning). */}
        <SelectValue placeholder={trigger}>{trigger}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {factIds.map((id) => (
          <SelectItem key={id} value={id} className="font-mono text-xs">
            {id}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
