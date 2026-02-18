import { applyAction, type MutationAction } from "./dataset-mutations";
import type { DatasetData } from "./types";

export type FieldChange = {
  field: string;
  from: string;
  to: string;
};

export type ChangeEntry = {
  id: string;
  timestamp: number;
  action: MutationAction | null;
  description: string;
  details: FieldChange[];
  isRevert?: boolean;
  isLifecycle?: boolean;
};

function formatValue(v: unknown): string {
  if (v === undefined) return "(none)";
  if (typeof v === "string") return v;
  if (typeof v === "boolean") return v ? "true" : "false";
  return JSON.stringify(v);
}

function diffFields(a: Record<string, unknown> | undefined, b: Record<string, unknown>): FieldChange[] {
  if (!a) return Object.entries(b).map(([field, val]) => ({ field, from: "(none)", to: formatValue(val) }));
  const changes: FieldChange[] = [];
  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of allKeys) {
    const av = JSON.stringify(a[key]);
    const bv = JSON.stringify(b[key]);
    if (av !== bv) {
      changes.push({ field: key, from: formatValue(a[key]), to: formatValue(b[key]) });
    }
  }
  return changes;
}

export function buildChangeEntry(action: MutationAction, dataBefore: DatasetData): ChangeEntry {
  const details = computeDetails(action, dataBefore);
  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    action,
    description: describeAction(action),
    details
  };
}

function computeDetails(action: MutationAction, before: DatasetData): FieldChange[] {
  switch (action.type) {
    case "SET_FACT":
      return diffFields(
        before.facts[action.id] as unknown as Record<string, unknown> | undefined,
        action.fact as unknown as Record<string, unknown>
      );
    case "ADD_FACT":
      return diffFields(undefined, action.fact as unknown as Record<string, unknown>);
    case "SET_QUESTION":
      return diffFields(
        before.questions[action.index] as unknown as Record<string, unknown> | undefined,
        action.question as unknown as Record<string, unknown>
      );
    case "ADD_QUESTION":
      return diffFields(undefined, action.question as unknown as Record<string, unknown>);
    case "SET_RULE":
      return diffFields(
        before.rules[action.index] as unknown as Record<string, unknown> | undefined,
        action.rule as unknown as Record<string, unknown>
      );
    case "ADD_RULE":
      return diffFields(undefined, action.rule as unknown as Record<string, unknown>);
    case "SET_CONSTANT_VALUE": {
      const existing = before.constants[action.group]?.find((v) => v.id === action.valueId);
      return diffFields(
        existing as unknown as Record<string, unknown> | undefined,
        action.value as unknown as Record<string, unknown>
      );
    }
    case "ADD_CONSTANT_VALUE":
      return diffFields(undefined, action.value as unknown as Record<string, unknown>);
    case "TOGGLE_CONSTANT_VALUE": {
      const val = before.constants[action.group]?.find((v) => v.id === action.valueId);
      return val ? [{ field: "enabled", from: formatValue(val.enabled), to: formatValue(action.enabled) }] : [];
    }
    case "DELETE_CONSTANT_VALUE": {
      const val = before.constants[action.group]?.find((v) => v.id === action.valueId);
      return val ? diffFields(val as unknown as Record<string, unknown>, {}) : [];
    }
    default:
      return [];
  }
}

function describeAction(action: MutationAction): string {
  switch (action.type) {
    case "SET_FACT":
      return `Edited fact "${action.id}"`;
    case "ADD_FACT":
      return `Added fact "${action.id}"`;
    case "DISCARD_FACT":
      return `Disabled fact "${action.id}"`;
    case "RESTORE_FACT":
      return `Enabled fact "${action.id}"`;
    case "SET_RULE":
      return `Edited rule #${action.index + 1}`;
    case "ADD_RULE":
      return `Added rule "${action.rule.sets}"`;
    case "DISCARD_RULE":
      return `Disabled rule #${action.index + 1}`;
    case "RESTORE_RULE":
      return `Enabled rule #${action.index + 1}`;
    case "SET_QUESTION":
      return `Edited question #${action.index + 1}`;
    case "ADD_QUESTION":
      return `Added question "${action.question.label}"`;
    case "DISCARD_QUESTION":
      return `Disabled question #${action.index + 1}`;
    case "RESTORE_QUESTION":
      return `Enabled question #${action.index + 1}`;
    case "SET_CONSTANT_VALUE":
      return `Edited constant "${action.group}" value #${action.valueId}`;
    case "ADD_CONSTANT_VALUE":
      return `Added value "${action.value.name}" to "${action.group}"`;
    case "TOGGLE_CONSTANT_VALUE":
      return `${action.enabled ? "Enabled" : "Disabled"} constant "${action.group}" value #${action.valueId}`;
    case "DELETE_CONSTANT_VALUE":
      return `Deleted constant "${action.group}" value #${action.valueId}`;
    default:
      return "Unknown change";
  }
}

export function replayChanges(base: DatasetData, entries: ChangeEntry[]): DatasetData {
  return entries.reduce((data, entry) => (entry.action ? applyAction(data, entry.action) : data), base);
}
