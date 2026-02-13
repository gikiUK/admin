import { buildChangeEntry, type ChangeEntry, replayChanges } from "./change-log";
import type { MutationAction } from "./dataset-mutations";
import { applyAction } from "./dataset-mutations";
import type { Dataset, DatasetData } from "./types";

// ── State ────────────────────────────────────────────────

export type DatasetState = {
  dataset: Dataset | null;
  original: DatasetData | null;
  changeLog: ChangeEntry[];
  isDirty: boolean;
  saving: boolean;
};

export const initialState: DatasetState = {
  dataset: null,
  original: null,
  changeLog: [],
  isDirty: false,
  saving: false
};

// ── Actions ──────────────────────────────────────────────

export type RevertFieldTarget =
  | { entity: "fact"; key: string; field: string }
  | { entity: "question"; index: number; field: string }
  | { entity: "rule"; index: number; field: string };

export type DatasetAction =
  | { type: "LOAD_DATASET"; payload: Dataset }
  | MutationAction
  | { type: "UNDO_CHANGE"; entryId: string }
  | { type: "UNDO_ALL" }
  | { type: "REVERT_FIELD"; target: RevertFieldTarget }
  | { type: "SET_SAVING"; saving: boolean }
  | { type: "MARK_SAVED" };

// ── Helpers ──────────────────────────────────────────────

function formatUnknown(v: unknown): string {
  if (v === undefined) return "(none)";
  if (typeof v === "string") return v;
  if (typeof v === "boolean") return v ? "true" : "false";
  return JSON.stringify(v);
}

function isMutationAction(action: DatasetAction): action is MutationAction {
  return (
    action.type === "SET_FACT" ||
    action.type === "ADD_FACT" ||
    action.type === "DISCARD_FACT" ||
    action.type === "RESTORE_FACT" ||
    action.type === "SET_RULE" ||
    action.type === "ADD_RULE" ||
    action.type === "DISCARD_RULE" ||
    action.type === "SET_QUESTION" ||
    action.type === "ADD_QUESTION" ||
    action.type === "DISCARD_QUESTION" ||
    action.type === "RESTORE_QUESTION"
  );
}

// ── Reducer ──────────────────────────────────────────────

export function datasetReducer(state: DatasetState, action: DatasetAction): DatasetState {
  switch (action.type) {
    case "LOAD_DATASET":
      return {
        dataset: action.payload,
        original: structuredClone(action.payload.data),
        changeLog: [],
        isDirty: false,
        saving: false
      };

    case "MARK_SAVED":
      return {
        ...state,
        original: state.dataset ? structuredClone(state.dataset.data) : null,
        changeLog: [],
        isDirty: false,
        saving: false
      };

    case "SET_SAVING":
      return { ...state, saving: action.saving };

    case "UNDO_CHANGE": {
      if (!state.dataset || !state.original) return state;
      const remaining = state.changeLog.filter((e) => e.id !== action.entryId);
      const data = replayChanges(structuredClone(state.original), remaining);
      return {
        ...state,
        dataset: { ...state.dataset, data },
        changeLog: remaining,
        isDirty: remaining.length > 0
      };
    }

    case "UNDO_ALL": {
      if (!state.dataset || !state.original) return state;
      return {
        ...state,
        dataset: { ...state.dataset, data: structuredClone(state.original) },
        changeLog: [],
        isDirty: false
      };
    }

    case "REVERT_FIELD": {
      if (!state.dataset || !state.original) return state;
      const { target } = action;
      const data = structuredClone(state.dataset.data);
      let entityLabel = "";
      let fromVal = "";
      let toVal = "";

      if (target.entity === "fact") {
        const orig = state.original.facts[target.key];
        const curr = data.facts[target.key];
        if (orig && curr) {
          fromVal = formatUnknown((curr as Record<string, unknown>)[target.field]);
          toVal = formatUnknown((orig as Record<string, unknown>)[target.field]);
          (curr as Record<string, unknown>)[target.field] = (orig as Record<string, unknown>)[target.field];
          entityLabel = target.key;
        }
      } else if (target.entity === "question") {
        const orig = state.original.questions[target.index];
        const curr = data.questions[target.index];
        if (orig && curr) {
          fromVal = formatUnknown((curr as Record<string, unknown>)[target.field]);
          toVal = formatUnknown((orig as Record<string, unknown>)[target.field]);
          (curr as Record<string, unknown>)[target.field] = (orig as Record<string, unknown>)[target.field];
          entityLabel = `question #${target.index + 1}`;
        }
      } else if (target.entity === "rule") {
        const orig = state.original.rules[target.index];
        const curr = data.rules[target.index];
        if (orig && curr) {
          fromVal = formatUnknown((curr as Record<string, unknown>)[target.field]);
          toVal = formatUnknown((orig as Record<string, unknown>)[target.field]);
          (curr as Record<string, unknown>)[target.field] = (orig as Record<string, unknown>)[target.field];
          entityLabel = `rule #${target.index + 1}`;
        }
      }

      const hasChanges = JSON.stringify(data) !== JSON.stringify(state.original);
      const revertEntry: ChangeEntry = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        action: null,
        description: `Reverted ${target.field} on ${entityLabel}`,
        details: [{ field: target.field, from: fromVal, to: toVal }],
        isRevert: true
      };

      return {
        ...state,
        dataset: { ...state.dataset, data },
        changeLog: [...state.changeLog, revertEntry],
        isDirty: hasChanges
      };
    }

    default: {
      if (!isMutationAction(action)) return state;
      if (!state.dataset) return state;

      const entry = buildChangeEntry(action, state.dataset.data);
      const data = applyAction(state.dataset.data, action);

      return {
        ...state,
        dataset: { ...state.dataset, data },
        changeLog: [...state.changeLog, entry],
        isDirty: true
      };
    }
  }
}
