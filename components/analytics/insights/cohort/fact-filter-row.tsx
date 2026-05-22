"use client";

import type { Dataset } from "@gikiuk/facts-engine";
import { Trash2 } from "lucide-react";
import {
  buildFactFilterOptions,
  findFactFilterQuestion
} from "@/components/analytics/insights/cohort/fact-filter-options";
import { QuestionPicker } from "@/components/analytics/insights/cohort/question-picker";
import { ValueBadges } from "@/components/analytics/insights/cohort/value-badges";
import { ValuePicker } from "@/components/analytics/insights/cohort/value-picker";
import { Button } from "@/components/ui/button";
import type { FactFilter } from "@/lib/analytics/insights/cohort-spec";

type Props = {
  filter: FactFilter;
  dataset: Dataset | null;
  onChange: (next: FactFilter) => void;
  onRemove: () => void;
};

export function FactFilterRow({ filter, dataset, onChange, onRemove }: Props) {
  const question = findFactFilterQuestion(dataset, filter.key);
  const options = buildFactFilterOptions(dataset, filter.key);
  const selectedKeys = filter.values.map(String);
  const isBoolean = question?.type === "boolean_state";

  function setKey(key: string) {
    onChange({ ...filter, key, values: [] });
  }

  function toggleValue(value: string | number | boolean) {
    // Booleans are single-select: picking Yes/No replaces, picking the same value clears.
    if (isBoolean) {
      const k = String(value);
      const next = selectedKeys.includes(k) ? [] : [value];
      onChange({ ...filter, values: next });
      return;
    }
    const k = String(value);
    const next = selectedKeys.includes(k) ? filter.values.filter((v) => String(v) !== k) : [...filter.values, value];
    onChange({ ...filter, values: next });
  }

  // Single-value booleans read as "is Yes"; multi-value filters keep "is any of".
  const connector = isBoolean ? "is" : "is any of";
  // Once a boolean has its single value picked, hide the "Add value" trigger — replace via the badge.
  const showValuePicker = filter.key && !(isBoolean && filter.values.length > 0);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border bg-card px-3 py-2">
      <QuestionPicker dataset={dataset} selectedKey={filter.key} selectedLabel={question?.label} onSelect={setKey} />
      <span className="text-xs text-muted-foreground">{connector}</span>
      <div className="flex flex-wrap items-center gap-1">
        <ValueBadges values={filter.values} options={options} onRemove={toggleValue} />
        {showValuePicker && <ValuePicker options={options} selectedKeys={selectedKeys} onToggle={toggleValue} />}
      </div>
      <Button variant="ghost" size="icon" onClick={onRemove} aria-label="Remove fact filter" className="ml-auto size-7">
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );
}
