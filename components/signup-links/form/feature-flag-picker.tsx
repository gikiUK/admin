"use client";

import { FeatureFlagCheckbox } from "@/components/signup-links/form/feature-flag-checkbox";
import { flagsRequiring, groupCatalogue, withRequiredFlags } from "@/components/signup-links/form/feature-flag-groups";
import { useFeatureFlagCatalogue } from "@/components/signup-links/form/use-form-data";
import { Button } from "@/components/ui/button";

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  /**
   * Flags that are on regardless of `value` — a premium subscription grants
   * some of them. They show ticked and read-only, and the bulk controls leave
   * them alone, since storing them wouldn't change anything.
   */
  lockedFlags?: string[];
};

export function FeatureFlagPicker({ value, onChange, lockedFlags = [] }: Props) {
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
  const locked = new Set(lockedFlags);
  const editable = catalogue.filter((flag) => !locked.has(flag));

  function toggle(flag: string) {
    if (!selected.has(flag)) {
      onChange(withRequiredFlags([...value, flag]).filter((f) => !locked.has(f)));
      return;
    }
    // Dropping a flag drops whatever depended on it, so the draft can't hold a
    // combination the app doesn't allow.
    const dropped = new Set([flag, ...flagsRequiring(flag)]);
    onChange(value.filter((f) => !dropped.has(f)));
  }

  if (catalogue.length === 0) {
    return <p className="text-xs text-muted-foreground">No flags available.</p>;
  }

  // Bulk controls only earn their place when there's more than one thing to
  // toggle — on a single checkbox they just repeat it.
  const showBulkControls = editable.length > 1;

  return (
    <div className="space-y-3">
      {showBulkControls && (
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => onChange(editable)}>
            Enable all
          </Button>
          <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => onChange([])}>
            Disable all
          </Button>
          <span className="text-xs text-muted-foreground">
            {new Set([...value, ...lockedFlags]).size} of {catalogue.length} enabled
          </span>
        </div>
      )}

      {groups.map((group) => (
        <div key={group.heading} className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">{group.heading}</span>
            {group.flags.length > 1 && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-5 px-1.5 text-[10px]"
                  onClick={() =>
                    onChange([...new Set([...value, ...group.flags.map((f) => f.flag).filter((f) => !locked.has(f))])])
                  }
                >
                  all on
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-5 px-1.5 text-[10px]"
                  onClick={() => {
                    const inGroup = new Set(group.flags.map((f) => f.flag));
                    onChange(value.filter((f) => !inGroup.has(f)));
                  }}
                >
                  all off
                </Button>
              </>
            )}
          </div>
          <div className="space-y-1.5 pl-1">
            {group.flags.map(({ flag, label }) => (
              <FeatureFlagCheckbox
                key={flag}
                flag={flag}
                label={label}
                checked={selected.has(flag)}
                locked={locked.has(flag)}
                onToggle={() => toggle(flag)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
