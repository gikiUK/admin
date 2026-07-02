"use client";

import { DebouncedInput } from "@/components/ui/debounced-input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FactsLookup } from "@/lib/blob/resolve";
import type { BlobOption, FactType, QuestionType } from "@/lib/blob/types";
import { FactsMappingEditor } from "./facts-mapping-editor";
import type { FactsMap } from "./facts-mapping-types";
import { OptionsListEditor } from "./options-list-editor";

type QuestionTypeFieldsProps = {
  type: QuestionType;
  fact: string;
  optionsRef: string;
  options: BlobOption[];
  factsMapping: FactsMap;
  facts: FactsLookup;
  constantGroupNames: string[];
  maxSelections?: number;
  onFactChange: (fact: string) => void;
  onOptionsRefChange: (ref: string) => void;
  onOptionsChange: (options: BlobOption[]) => void;
  onFactsMappingChange: (facts: FactsMap) => void;
  onMaxSelectionsChange: (max: number | undefined) => void;
};

/** Each question type sets facts of exactly one type:
 *  boolean_state → boolean_state fact, single-select → enum,
 *  multi-select → array, checkbox-radio-hybrid → boolean_state facts. */
function factIdsOfType(facts: FactsLookup, factType: FactType): string[] {
  return Object.keys(facts).filter((id) => facts[id].type === factType);
}

export function QuestionTypeFields({
  type,
  fact,
  optionsRef,
  options,
  factsMapping,
  facts,
  constantGroupNames,
  maxSelections,
  onFactChange,
  onOptionsRefChange,
  onOptionsChange,
  onFactsMappingChange,
  onMaxSelectionsChange
}: QuestionTypeFieldsProps) {
  if (type === "boolean_state") {
    return (
      <div className="space-y-2">
        <Label>Fact</Label>
        <FactSelect value={fact} factIds={factIdsOfType(facts, "boolean_state")} onChange={onFactChange} />
      </div>
    );
  }

  if (type === "single-select" || type === "multi-select") {
    const factType = type === "single-select" ? "enum" : "array";
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Fact</Label>
          <FactSelect value={fact} factIds={factIdsOfType(facts, factType)} onChange={onFactChange} />
        </div>
        <div className="space-y-2">
          <Label>Options ref (constant group)</Label>
          <Select value={optionsRef || "__none"} onValueChange={(v) => onOptionsRefChange(v === "__none" ? "" : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select constant group..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none">None</SelectItem>
              {constantGroupNames.map((name) => (
                <SelectItem key={name} value={name} className="font-mono text-xs">
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {type === "multi-select" && (
          <div className="space-y-2">
            <Label htmlFor="q-max-selections">Max selections</Label>
            <DebouncedInput
              id="q-max-selections"
              type="number"
              min={1}
              value={maxSelections?.toString() ?? ""}
              onCommit={(v) => {
                const n = Number.parseInt(v, 10);
                onMaxSelectionsChange(Number.isNaN(n) || n < 1 ? undefined : n);
              }}
              placeholder="Unlimited"
              className="w-40"
            />
          </div>
        )}
      </div>
    );
  }

  // checkbox-radio-hybrid: the mapping can only hold true/false/unknown,
  // so only boolean_state facts can be mapped.
  return (
    <div className="space-y-4">
      <OptionsListEditor options={options} onChange={onOptionsChange} />
      <FactsMappingEditor
        facts={factsMapping}
        options={options}
        factIds={factIdsOfType(facts, "boolean_state")}
        onChange={onFactsMappingChange}
      />
    </div>
  );
}

function FactSelect({ value, factIds, onChange }: { value: string; factIds: string[]; onChange: (v: string) => void }) {
  // Keep a stale/mismatched reference visible rather than blanking the field.
  const ids = value && !factIds.includes(value) ? [value, ...factIds] : factIds;

  return (
    <Select value={value || "__none"} onValueChange={(v) => onChange(v === "__none" ? "" : v)}>
      <SelectTrigger className="font-mono text-xs">
        <SelectValue placeholder="Select fact..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__none">None</SelectItem>
        {ids.map((id) => (
          <SelectItem key={id} value={id} className="font-mono text-xs">
            {id}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
