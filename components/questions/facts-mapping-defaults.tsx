"use client";

import { AddFactSelect } from "./add-fact-select";
import { FactValueRow } from "./fact-value-row";
import type { TriState } from "./facts-mapping-types";

type FactsMappingDefaultsProps = {
  defaults: Record<string, string | boolean>;
  availableFacts: string[];
  onDefaultChange: (factId: string, value: TriState) => void;
  onAddFact: (factId: string) => void;
  onRemoveFact: (factId: string) => void;
};

export function FactsMappingDefaults({
  defaults,
  availableFacts,
  onDefaultChange,
  onAddFact,
  onRemoveFact
}: FactsMappingDefaultsProps) {
  const factIds = Object.keys(defaults);

  return (
    <div className="space-y-2 rounded-md border p-3">
      <div>
        <h3 className="text-xs font-semibold">Defaults</h3>
        <p className="text-xs text-muted-foreground">
          Every fact this question controls starts at its default value on each answer. The selected options below
          override them.
        </p>
      </div>
      {factIds.map((id) => (
        <FactValueRow
          key={id}
          factId={id}
          value={defaults[id]}
          onChange={(v) => onDefaultChange(id, v)}
          onRemove={() => onRemoveFact(id)}
        />
      ))}
      <AddFactSelect label="Add fact" factIds={availableFacts} onAdd={onAddFact} />
    </div>
  );
}
