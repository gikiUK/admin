import { buildChangeEntry, type ChangeEntry, replayChanges } from "./change-log";
import type { MutationAction } from "./dataset-mutations";
import { applyAction } from "./dataset-mutations";
import type { Dataset, DatasetData } from "./types";

// ── State ────────────────────────────────────────────────

export type DatasetState = {
  live: Dataset | null;
  draft: Dataset | null;
  /** The active dataset: draft if editing, otherwise live. */
  dataset: Dataset | null;
  original: DatasetData | null;
  changeLog: ChangeEntry[];
  isDirty: boolean;
  saving: boolean;
  loading: boolean;
  isEditing: boolean;
};

export const initialState: DatasetState = {
  live: null,
  draft: null,
  dataset: null,
  original: null,
  changeLog: [],
  isDirty: false,
  saving: false,
  loading: true,
  isEditing: false
};

// ── Actions ──────────────────────────────────────────────

export type RevertFieldTarget =
  | { entity: "fact"; key: string; field: string }
  | { entity: "question"; index: number; field: string }
  | { entity: "rule"; index: number; field: string };

export type DatasetAction =
  | { type: "LOAD_LIVE"; payload: Dataset }
  | { type: "LOAD_DRAFT"; payload: Dataset }
  | { type: "DRAFT_CREATED"; payload: Dataset }
  | { type: "DRAFT_DELETED" }
  | { type: "DRAFT_PUBLISHED"; payload: Dataset }
  | MutationAction
  | { type: "UNDO_CHANGE"; entryId: string }
  | { type: "UNDO_ALL" }
  | { type: "REVERT_FIELD"; target: RevertFieldTarget }
  | { type: "SET_SAVING"; saving: boolean }
  | { type: "MARK_SAVED"; payload: Dataset };

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
    case "LOAD_LIVE":
      return {
        ...state,
        live: action.payload,
        dataset: state.draft ?? action.payload,
        original: state.draft ? state.original : structuredClone(action.payload.data),
        loading: false,
        isEditing: !!state.draft
      };

    case "LOAD_DRAFT":
      return {
        ...state,
        draft: action.payload,
        dataset: action.payload,
        original: structuredClone(action.payload.data),
        changeLog: [],
        isDirty: false,
        isEditing: true
      };

    case "DRAFT_CREATED":
      return {
        ...state,
        draft: action.payload,
        dataset: action.payload,
        original: structuredClone(action.payload.data),
        changeLog: [],
        isDirty: false,
        isEditing: true
      };

    case "DRAFT_DELETED":
      return {
        ...state,
        draft: null,
        dataset: state.live,
        original: state.live ? structuredClone(state.live.data) : null,
        changeLog: [],
        isDirty: false,
        isEditing: false
      };

    case "DRAFT_PUBLISHED":
      return {
        ...state,
        live: action.payload,
        draft: null,
        dataset: action.payload,
        original: structuredClone(action.payload.data),
        changeLog: [],
        isDirty: false,
        saving: false,
        isEditing: false
      };

    case "MARK_SAVED":
      return {
        ...state,
        draft: action.payload,
        dataset: action.payload,
        original: structuredClone(action.payload.data),
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
