"use client";

import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { BlobOption } from "@/lib/blob/types";
import { formatFactName } from "@/lib/utils";

type FactsMap = Record<string, Record<string, string | boolean>>;

type FactsMappingEditorProps = {
  facts: FactsMap;
  options: BlobOption[];
  allFactIds: string[];
  onChange: (facts: FactsMap) => void;
};

const VALUE_OPTIONS = [
  { value: "__true", label: "true" },
  { value: "__false", label: "false" },
  { value: "unknown", label: "unknown" }
];

function toSelectValue(v: string | boolean): string {
  if (v === true) return "__true";
  if (v === false) return "__false";
  return String(v);
}

function fromSelectValue(v: string): string | boolean {
  if (v === "__true") return true;
  if (v === "__false") return false;
  return v;
}

export function FactsMappingEditor({ facts, options, allFactIds, onChange }: FactsMappingEditorProps) {
  const defaults = facts.defaults ?? {};
  const factIds = Object.keys(defaults);
  const optionValues = options.map((o) => o.value).filter(Boolean);

  function handleCellChange(optionKey: string, factId: string, value: string | boolean) {
    const next = { ...facts, [optionKey]: { ...facts[optionKey], [factId]: value } };
    onChange(next);
  }

  function handleDefaultChange(factId: string, value: string | boolean) {
    const next = { ...facts, defaults: { ...defaults, [factId]: value } };
    onChange(next);
  }

  function handleAddFact(factId: string) {
    const next: FactsMap = { ...facts, defaults: { ...defaults, [factId]: false } };
    for (const optVal of optionValues) {
      next[optVal] = { ...(next[optVal] ?? {}), [factId]: false };
    }
    onChange(next);
  }

  function handleRemoveFact(factId: string) {
    const nextDefaults = { ...defaults };
    delete nextDefaults[factId];
    const next: FactsMap = { ...facts, defaults: nextDefaults };
    for (const optVal of optionValues) {
      if (next[optVal]) {
        const copy = { ...next[optVal] };
        delete copy[factId];
        next[optVal] = copy;
      }
    }
    onChange(next);
  }

  const availableFacts = allFactIds.filter((id) => !factIds.includes(id));

  return (
    <div className="space-y-3">
      <Label className="text-xs font-medium">Facts mapping</Label>

      {factIds.length > 0 && (
        <div className="overflow-x-auto rounded border">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-2 py-1.5 text-left font-medium">Fact</th>
                <th className="px-2 py-1.5 text-left font-medium">Default</th>
                {optionValues.map((v) => (
                  <th key={v} className="px-2 py-1.5 text-left font-medium font-mono">
                    {v}
                  </th>
                ))}
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {factIds.map((factId) => (
                <tr key={factId} className="border-b last:border-b-0">
                  <td className="px-2 py-1 text-xs font-semibold uppercase tracking-wide">
                    {formatFactName(factId)}
                  </td>
                  <td className="px-2 py-1">
                    <CellSelect value={defaults[factId]} onChange={(v) => handleDefaultChange(factId, v)} />
                  </td>
                  {optionValues.map((optVal) => (
                    <td key={optVal} className="px-2 py-1">
                      <CellSelect
                        value={facts[optVal]?.[factId] ?? defaults[factId]}
                        onChange={(v) => handleCellChange(optVal, factId, v)}
                      />
                    </td>
                  ))}
                  <td className="px-2 py-1">
                    <Button variant="ghost" size="icon-xs" onClick={() => handleRemoveFact(factId)}>
                      <X className="size-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {availableFacts.length > 0 && (
        <Select onValueChange={handleAddFact}>
          <SelectTrigger className="w-[250px]">
            <div className="flex items-center gap-1.5">
              <Plus className="size-3" />
              <span>Add fact</span>
            </div>
          </SelectTrigger>
          <SelectContent>
            {availableFacts.map((id) => (
              <SelectItem key={id} value={id} className="font-mono text-xs">
                {id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

function CellSelect({ value, onChange }: { value: string | boolean; onChange: (v: string | boolean) => void }) {
  return (
    <Select value={toSelectValue(value)} onValueChange={(v) => onChange(fromSelectValue(v))}>
      <SelectTrigger className="h-7 w-[90px] text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {VALUE_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} className="text-xs">
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
