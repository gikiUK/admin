"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type Props = {
  value: boolean | undefined;
  onChange: (next: boolean | undefined) => void;
};

function toToggleValue(value: boolean | undefined): "yes" | "no" | "any" {
  if (value === true) return "yes";
  if (value === false) return "no";
  return "any";
}

function fromToggleValue(toggle: string): boolean | undefined {
  if (toggle === "yes") return true;
  if (toggle === "no") return false;
  return undefined;
}

export function TrackedActionsToggle({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Has tracked actions</span>
      <ToggleGroup
        type="single"
        value={toToggleValue(value)}
        onValueChange={(v) => v && onChange(fromToggleValue(v))}
        variant="outline"
        size="sm"
      >
        <ToggleGroupItem value="any">Any</ToggleGroupItem>
        <ToggleGroupItem value="yes">With actions</ToggleGroupItem>
        <ToggleGroupItem value="no">Without</ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
