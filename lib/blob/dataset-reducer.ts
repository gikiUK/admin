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

export type DatasetAction =
  | { type: "LOAD_DATASET"; payload: Dataset }
  | MutationAction
  | { type: "UNDO_CHANGE"; entryId: string }
  | { type: "UNDO_ALL" }
  | { type: "SET_SAVING"; saving: boolean }
  | { type: "MARK_SAVED" };

// ── Helpers ──────────────────────────────────────────────

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
