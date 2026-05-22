"use client";

import { KeyPickerPopover } from "@/components/analytics/insights/shared/key-picker-popover";
import { CommandItem } from "@/components/ui/command";
import { useLiveDataset } from "@/lib/analytics/use-live-dataset";

type Props = {
  showBaseline: boolean;
  selectedKeys: string[];
  onAdd: (key: string) => void;
};

export function FactsBreakdownGridHeader({ showBaseline, selectedKeys, onAdd }: Props) {
  const { data: dataset } = useLiveDataset();
  const available = dataset?.data.questions.filter((q) => q.enabled && !selectedKeys.includes(q.key)) ?? [];

  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Fact breakdowns</h2>
        {showBaseline && (
          <p className="text-xs text-muted-foreground">
            Bars show how the cohort differs from the all-orgs baseline (percentage points). Click a bar to filter.
          </p>
        )}
      </div>
      <KeyPickerPopover
        triggerLabel="Add fact"
        inputPlaceholder="Search facts…"
        emptyLabel={dataset === null ? "Loading dataset…" : "No facts left."}
      >
        {(close) =>
          available.map((q) => (
            <CommandItem
              key={q.key}
              value={`${q.label} ${q.key}`}
              onSelect={() => {
                onAdd(q.key);
                close();
              }}
              className="flex flex-col items-start gap-0.5 py-2"
            >
              <span className="text-sm">{q.label}</span>
              <span className="text-[10px] text-muted-foreground">{q.key}</span>
            </CommandItem>
          ))
        }
      </KeyPickerPopover>
    </div>
  );
}
