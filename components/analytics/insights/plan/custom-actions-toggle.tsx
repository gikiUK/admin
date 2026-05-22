"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type Props = {
  value: boolean;
  onChange: (next: boolean) => void;
};

export function CustomActionsToggle({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Custom actions</span>
      <Label className="flex cursor-pointer items-center gap-2 text-sm font-normal">
        <Switch checked={value} onCheckedChange={onChange} />
        <span>Include custom actions</span>
        <span className="text-xs text-muted-foreground">(no rich metadata)</span>
      </Label>
    </div>
  );
}
