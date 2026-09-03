"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type Props = {
  flag: string;
  label: string;
  checked: boolean;
  /** Forced on elsewhere (e.g. by a subscription), so it can't be edited here. */
  locked: boolean;
  onToggle: () => void;
};

export function FeatureFlagCheckbox({ flag, label, checked, locked, onToggle }: Props) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id={`flag-${flag}`} checked={locked || checked} disabled={locked} onCheckedChange={onToggle} />
      <Label htmlFor={`flag-${flag}`} className="text-sm font-normal">
        {label}
      </Label>
      {locked && (
        <span className="rounded-full bg-purple-600 px-1.5 py-px text-[10px] font-bold leading-4 text-white">
          PREMIUM
        </span>
      )}
    </div>
  );
}
