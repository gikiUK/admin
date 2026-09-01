"use client";

import { groupCatalogue } from "@/components/signup-links/form/feature-flag-groups";
import { useFeatureFlagCatalogue } from "@/components/signup-links/form/use-form-data";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
};

export function FeatureFlagPicker({ value, onChange }: Props) {
  const state = useFeatureFlagCatalogue();

  if (state.status === "loading") {
    return <p className="text-xs text-muted-foreground">Loading flags…</p>;
  }
  if (state.status === "error") {
    return <p className="text-xs text-destructive">{state.message}</p>;
  }

  const catalogue = state.value;
  const groups = groupCatalogue(catalogue);
  const selected = new Set(value);

  function toggle(flag: string) {
    onChange(selected.has(flag) ? value.filter((f) => f !== flag) : [...value, flag]);
  }

  if (catalogue.length === 0) {
    return <p className="text-xs text-muted-foreground">No flags available.</p>;
  }

  // Bulk controls only earn their place when there's more than one thing to
  // toggle — on a single checkbox they just repeat it.
  const showBulkControls = catalogue.length > 1;

  return (
    <div className="space-y-3">
      {showBulkControls && (
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => onChange(catalogue)}>
            Enable all
          </Button>
          <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => onChange([])}>
            Disable all
          </Button>
          <span className="text-xs text-muted-foreground">
            {value.length} of {catalogue.length} enabled
          </span>
        </div>
      )}

      {groups.map((group) => (
        <div key={group.heading} className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">{group.heading}</span>
            {group.flags.length > 1 && (
              <>
                <button
                  type="button"
                  className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                  onClick={() => onChange([...new Set([...value, ...group.flags.map((f) => f.flag)])])}
                >
                  all on
                </button>
                <button
                  type="button"
                  className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                  onClick={() => {
                    const inGroup = new Set(group.flags.map((f) => f.flag));
                    onChange(value.filter((f) => !inGroup.has(f)));
                  }}
                >
                  all off
                </button>
              </>
            )}
          </div>
          <div className="space-y-1.5 pl-1">
            {group.flags.map(({ flag, label }) => (
              <div key={flag} className="flex items-center gap-2">
                <Checkbox id={`flag-${flag}`} checked={selected.has(flag)} onCheckedChange={() => toggle(flag)} />
                <Label htmlFor={`flag-${flag}`} className="text-sm font-normal">
                  {label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
