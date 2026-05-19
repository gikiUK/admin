"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type Option = { value: string; label: string };

type Props = {
  legend: string;
  options: Option[];
  value: string[];
  onChange: (next: string[]) => void;
};

export function MultiCheckGroup({ legend, options, value, onChange }: Props) {
  function toggle(option: string) {
    const next = value.includes(option) ? value.filter((v) => v !== option) : [...value, option];
    onChange(next);
  }

  return (
    <fieldset className="space-y-2">
      <legend className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{legend}</legend>
      <div className="flex flex-wrap gap-3">
        {options.map((option) => (
          <Label key={option.value} className="flex cursor-pointer items-center gap-2 text-sm font-normal">
            <Checkbox checked={value.includes(option.value)} onCheckedChange={() => toggle(option.value)} />
            <span>{option.label}</span>
          </Label>
        ))}
      </div>
    </fieldset>
  );
}
