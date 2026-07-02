"use client";

import { Label } from "@/components/ui/label";
import type { BlobOption } from "@/lib/blob/types";
import { FactsMappingDefaults } from "./facts-mapping-defaults";
import { FactsMappingOptionCard } from "./facts-mapping-option-card";
import type { FactsMap, TriState } from "./facts-mapping-types";

type FactsMappingEditorProps = {
  facts: FactsMap;
  options: BlobOption[];
  /** Facts eligible for mapping — boolean_state only, since the map holds true/false/unknown. */
  factIds: string[];
  onChange: (facts: FactsMap) => void;
};

export function FactsMappingEditor({ facts, options, factIds: eligibleFactIds, onChange }: FactsMappingEditorProps) {
  const defaults = facts.defaults ?? {};
  const factIds = Object.keys(defaults);
  const availableFacts = eligibleFactIds.filter((id) => !factIds.includes(id));
  const validOptions = options.filter((o) => o.value);

  function setOverride(optionKey: string, factId: string, value: TriState) {
    onChange({ ...facts, [optionKey]: { ...(facts[optionKey] ?? {}), [factId]: value } });
  }

  function addOverride(optionKey: string, factId: string) {
    // Start from the value an override most likely wants: the opposite of the default.
    setOverride(optionKey, factId, defaults[factId] !== true);
  }

  function removeOverride(optionKey: string, factId: string) {
    const overrides = { ...(facts[optionKey] ?? {}) };
    delete overrides[factId];
    const next = { ...facts };
    if (Object.keys(overrides).length === 0) {
      delete next[optionKey];
    } else {
      next[optionKey] = overrides;
    }
    onChange(next);
  }

  function handleDefaultChange(factId: string, value: TriState) {
    onChange({ ...facts, defaults: { ...defaults, [factId]: value } });
  }

  function handleAddFact(factId: string) {
    onChange({ ...facts, defaults: { ...defaults, [factId]: false } });
  }

  function handleRemoveFact(factId: string) {
    const nextDefaults = { ...defaults };
    delete nextDefaults[factId];
    const next: FactsMap = { ...facts, defaults: nextDefaults };
    for (const opt of validOptions) {
      const overrides = next[opt.value];
      if (!overrides || !(factId in overrides)) continue;
      const copy = { ...overrides };
      delete copy[factId];
      if (Object.keys(copy).length === 0) {
        delete next[opt.value];
      } else {
        next[opt.value] = copy;
      }
    }
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <Label className="text-xs font-medium">Facts mapping</Label>
      <FactsMappingDefaults
        defaults={defaults}
        availableFacts={availableFacts}
        onDefaultChange={handleDefaultChange}
        onAddFact={handleAddFact}
        onRemoveFact={handleRemoveFact}
      />
      {factIds.length > 0 &&
        validOptions.map((option) => (
          <FactsMappingOptionCard
            key={option.value}
            option={option}
            overrides={facts[option.value] ?? {}}
            mappedFactIds={factIds}
            onSetOverride={(factId, v) => setOverride(option.value, factId, v)}
            onAddOverride={(factId) => addOverride(option.value, factId)}
            onRemoveOverride={(factId) => removeOverride(option.value, factId)}
          />
        ))}
    </div>
  );
}
