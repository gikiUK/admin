"use client";

import { ALL_METADATA_KEYS, METADATA_KEY_LABELS } from "@/components/analytics/insights/plan/metadata-keys";
import { KeyPickerPopover } from "@/components/analytics/insights/shared/key-picker-popover";
import { CommandItem } from "@/components/ui/command";

type Props = {
  selectedKeys: string[];
  onAdd: (key: string) => void;
};

export function PlanBreakdownGridHeader({ selectedKeys, onAdd }: Props) {
  const available = ALL_METADATA_KEYS.filter((k) => !selectedKeys.includes(k));

  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold tracking-tight">Action metadata breakdowns</h2>
      <KeyPickerPopover
        triggerLabel="Add field"
        inputPlaceholder="Search fields…"
        emptyLabel="No fields left."
        contentWidthClassName="w-[280px]"
      >
        {(close) =>
          available.map((key) => (
            <CommandItem
              key={key}
              value={METADATA_KEY_LABELS[key]}
              onSelect={() => {
                onAdd(key);
                close();
              }}
            >
              <span>{METADATA_KEY_LABELS[key]}</span>
            </CommandItem>
          ))
        }
      </KeyPickerPopover>
    </div>
  );
}
