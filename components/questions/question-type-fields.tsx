"use client";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CheckboxRadioOption, QuestionType } from "@/lib/data/types";
import { FactsMappingEditor } from "./facts-mapping-editor";
import { OptionsListEditor } from "./options-list-editor";

type FactsMap = Record<string, Record<string, string | boolean>>;

type QuestionTypeFieldsProps = {
  type: QuestionType;
  fact: string;
  optionsRef: string;
  options: CheckboxRadioOption[];
  factsMapping: FactsMap;
  allFactIds: string[];
  constantGroupNames: string[];
  onFactChange: (fact: string) => void;
  onOptionsRefChange: (ref: string) => void;
  onOptionsChange: (options: CheckboxRadioOption[]) => void;
  onFactsMappingChange: (facts: FactsMap) => void;
};

export function QuestionTypeFields({
  type,
  fact,
  optionsRef,
  options,
  factsMapping,
  allFactIds,
  constantGroupNames,
  onFactChange,
  onOptionsRefChange,
  onOptionsChange,
  onFactsMappingChange
}: QuestionTypeFieldsProps) {
  if (type === "boolean_state") {
    return (
      <div className="space-y-2">
        <Label>Fact</Label>
        <FactSelect value={fact} factIds={allFactIds} onChange={onFactChange} />
      </div>
    );
  }

  if (type === "single-select" || type === "multi-select") {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Fact</Label>
          <FactSelect value={fact} factIds={allFactIds} onChange={onFactChange} />
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
      </div>
    );
  }

  // checkbox-radio-hybrid
  return (
    <div className="space-y-4">
      <OptionsListEditor options={options} onChange={onOptionsChange} />
      <FactsMappingEditor
        facts={factsMapping}
        options={options}
        allFactIds={allFactIds}
        onChange={onFactsMappingChange}
      />
    </div>
  );
}

function FactSelect({ value, factIds, onChange }: { value: string; factIds: string[]; onChange: (v: string) => void }) {
  return (
    <Select value={value || "__none"} onValueChange={(v) => onChange(v === "__none" ? "" : v)}>
      <SelectTrigger className="font-mono text-xs">
        <SelectValue placeholder="Select fact..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__none">None</SelectItem>
        {factIds.map((id) => (
          <SelectItem key={id} value={id} className="font-mono text-xs">
            {id}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
