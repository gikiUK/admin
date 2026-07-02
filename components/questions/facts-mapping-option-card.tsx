"use client";

import { Badge } from "@/components/ui/badge";
import type { BlobOption } from "@/lib/blob/types";
import { AddFactSelect } from "./add-fact-select";
import { FactValueRow } from "./fact-value-row";
import type { TriState } from "./facts-mapping-types";

type FactsMappingOptionCardProps = {
  option: BlobOption;
  overrides: Record<string, string | boolean>;
  mappedFactIds: string[];
  onSetOverride: (factId: string, value: TriState) => void;
  onAddOverride: (factId: string) => void;
  onRemoveOverride: (factId: string) => void;
};

export function FactsMappingOptionCard({
  option,
  overrides,
  mappedFactIds,
  onSetOverride,
  onAddOverride,
  onRemoveOverride
}: FactsMappingOptionCardProps) {
  const overriddenIds = mappedFactIds.filter((id) => id in overrides);
  const availableIds = mappedFactIds.filter((id) => !(id in overrides));

  return (
    <div className="space-y-2 rounded-md border p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs">
          <span className="text-muted-foreground">When</span>
          <span className="font-medium">“{option.label}”</span>
          <code className="rounded-md border bg-muted px-1.5 py-0.5 font-mono text-muted-foreground">
            {option.value}
          </code>
          <span className="text-muted-foreground">is selected, set:</span>
        </div>
        {option.exclusive && (
          <Badge variant="outline" className="shrink-0">
            exclusive
          </Badge>
        )}
      </div>
      {overriddenIds.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nothing — every fact keeps its default.</p>
      ) : (
        overriddenIds.map((id) => (
          <FactValueRow
            key={id}
            factId={id}
            value={overrides[id]}
            onChange={(v) => onSetOverride(id, v)}
            onRemove={() => onRemoveOverride(id)}
          />
        ))
      )}
      <AddFactSelect label="Set fact" factIds={availableIds} onAdd={onAddOverride} />
    </div>
  );
}
