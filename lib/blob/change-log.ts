import { applyAction, type MutationAction } from "./dataset-mutations";
import type { DatasetData } from "./types";

export type FieldChange = {
  field: string;
  from: string;
  to: string;
};

export type EntityRef =
  | { type: "fact"; key: string }
  | { type: "question"; index: number }
  | { type: "rule"; index: number }
  | { type: "constant"; group: string; valueId: number };

export type ChangeEntry = {
  id: string;
  timestamp: number;
  action: MutationAction | null;
  description: string;
  details: FieldChange[];
  entityRef?: EntityRef;
  entityBefore?: unknown;
  entityAfter?: unknown;
  isRevert?: boolean;
  isLifecycle?: boolean;
  /** When true, replaying this entry resets data back to the history base (used by "discard draft"). */
  isDiscard?: boolean;
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

export function entityRefFromAction(action: MutationAction): EntityRef | undefined {
  switch (action.type) {
    case "SET_FACT":
    case "ADD_FACT":
    case "DISCARD_FACT":
    case "RESTORE_FACT":
      return { type: "fact", key: action.id };
    case "SET_QUESTION":
    case "ADD_QUESTION":
    case "DISCARD_QUESTION":
    case "RESTORE_QUESTION":
      return { type: "question", index: "index" in action ? action.index : -1 };
    case "SET_RULE":
    case "ADD_RULE":
    case "DISCARD_RULE":
    case "RESTORE_RULE":
      return { type: "rule", index: "index" in action ? action.index : -1 };
    case "SET_CONSTANT_VALUE":
    case "ADD_CONSTANT_VALUE":
    case "TOGGLE_CONSTANT_VALUE":
    case "DELETE_CONSTANT_VALUE":
      return { type: "constant", group: action.group, valueId: "valueId" in action ? action.valueId : -1 };
    default:
      return undefined;
  }
}

function lookupEntity(data: DatasetData, ref: EntityRef): unknown {
  switch (ref.type) {
    case "fact":
      return data.facts[ref.key] ?? undefined;
    case "question":
      return ref.index >= 0 ? data.questions[ref.index] : undefined;
    case "rule":
      return ref.index >= 0 ? data.rules[ref.index] : undefined;
    case "constant":
      return data.constants[ref.group]?.find((v) => v.id === ref.valueId) ?? undefined;
  }
}

export function buildChangeEntry(action: MutationAction, dataBefore: DatasetData): ChangeEntry {
  const details = computeDetails(action, dataBefore);
  const entityRef = entityRefFromAction(action);
  const entityBefore = entityRef ? lookupEntity(dataBefore, entityRef) : undefined;
  const dataAfter = applyAction(dataBefore, action);
  // For ADD_QUESTION/ADD_RULE, the new entity is at the end of the array
  const afterRef = resolveAfterRef(action, entityRef, dataAfter);
  const entityAfter = afterRef ? lookupEntity(dataAfter, afterRef) : undefined;
  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    action,
    description: describeAction(action),
    details,
    entityRef: afterRef ?? entityRef,
    entityBefore: entityBefore ? structuredClone(entityBefore) : undefined,
    entityAfter: entityAfter ? structuredClone(entityAfter) : undefined
  };
}

/** For ADD actions, the entityRef index is -1 at creation time — resolve to actual index after apply. */
function resolveAfterRef(
  action: MutationAction,
  ref: EntityRef | undefined,
  dataAfter: DatasetData
): EntityRef | undefined {
  if (!ref) return undefined;
  if (action.type === "ADD_QUESTION") return { type: "question", index: dataAfter.questions.length - 1 };
  if (action.type === "ADD_RULE") return { type: "rule", index: dataAfter.rules.length - 1 };
  return ref;
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
  return entries.reduce(
    (data, entry) => (entry.isDiscard ? structuredClone(base) : entry.action ? applyAction(data, entry.action) : data),
    base
  );
}
