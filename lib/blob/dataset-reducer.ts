import { buildChangeEntry, type ChangeEntry, replayChanges } from "./change-log";
import type { MutationAction } from "./dataset-mutations";
import { applyAction } from "./dataset-mutations";
import type { Dataset, DatasetData } from "./types";

// ── State ────────────────────────────────────────────────

export type SaveStatus = "idle" | "saving" | "saved" | "error";

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
  pendingMutations: MutationAction[];
  draftCreating: boolean;
  saveStatus: SaveStatus;
  lastSavedAt: number | null;
  /** Increments on each data change (mutation, undo, revert), used by auto-save to debounce. */
  mutationVersion: number;
  /** Set to mutationVersion after a successful auto-save. */
  savedVersion: number;
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
  isEditing: false,
  pendingMutations: [],
  draftCreating: false,
  saveStatus: "idle",
  lastSavedAt: null,
  mutationVersion: 0,
  savedVersion: 0
};

// ── Actions ──────────────────────────────────────────────

export type RevertFieldTarget =
  | { entity: "fact"; key: string; field: string }
  | { entity: "question"; index: number; field: string }
  | { entity: "rule"; index: number; field: string }
  | { entity: "constant"; group: string; valueId: number; field: string };

export type DatasetAction =
  | { type: "LOAD_LIVE"; payload: Dataset }
  | { type: "LOAD_DRAFT"; payload: Dataset }
  | { type: "DRAFT_CREATED"; payload: Dataset }
  | { type: "DRAFT_CREATING" }
  | { type: "DRAFT_CREATE_FAILED" }
  | { type: "DRAFT_DELETED" }
  | { type: "DRAFT_PUBLISHED"; payload: Dataset }
  | MutationAction
  | { type: "QUEUE_MUTATION"; mutation: MutationAction }
  | { type: "UNDO_CHANGE"; entryId: string }
  | { type: "UNDO_ALL" }
  | { type: "REVERT_FIELD"; target: RevertFieldTarget }
  | { type: "SET_SAVING"; saving: boolean }
  | { type: "MARK_SAVED"; payload: Dataset }
  | { type: "SET_SAVE_STATUS"; status: SaveStatus }
  | { type: "AUTO_SAVED"; payload: Dataset; savedVersion: number };

// ── Helpers ──────────────────────────────────────────────

function formatUnknown(v: unknown): string {
  if (v === undefined) return "(none)";
  if (typeof v === "string") return v;
  if (typeof v === "boolean") return v ? "true" : "false";
  return JSON.stringify(v);
}

export function isMutationAction(action: DatasetAction): action is MutationAction {
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
    action.type === "RESTORE_QUESTION" ||
    action.type === "SET_CONSTANT_VALUE" ||
    action.type === "ADD_CONSTANT_VALUE" ||
    action.type === "TOGGLE_CONSTANT_VALUE" ||
    action.type === "DELETE_CONSTANT_VALUE"
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
        original: state.live ? structuredClone(state.live.data) : structuredClone(action.payload.data),
        changeLog: [],
        isDirty: state.live ? JSON.stringify(state.live.data) !== JSON.stringify(action.payload.data) : false,
        isEditing: true
      };

    case "DRAFT_CREATING":
      return { ...state, draftCreating: true };

    case "DRAFT_CREATE_FAILED":
      return { ...state, draftCreating: false, pendingMutations: [] };

    case "DRAFT_CREATED": {
      // Replay any mutations that were queued while draft was being created
      let data = action.payload.data;
      const entries: ChangeEntry[] = [];
      for (const mutation of state.pendingMutations) {
        entries.push(buildChangeEntry(mutation, data));
        data = applyAction(data, mutation);
      }
      const hasPending = state.pendingMutations.length > 0;
      return {
        ...state,
        draft: { ...action.payload, data },
        dataset: { ...action.payload, data },
        original: state.live ? structuredClone(state.live.data) : structuredClone(action.payload.data),
        changeLog: entries,
        isDirty: hasPending,
        isEditing: true,
        draftCreating: false,
        pendingMutations: []
      };
    }

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

    case "QUEUE_MUTATION":
      return { ...state, pendingMutations: [...state.pendingMutations, action.mutation] };

    case "MARK_SAVED":
      return {
        ...state,
        draft: action.payload,
        dataset: action.payload,
        original: state.live ? structuredClone(state.live.data) : structuredClone(action.payload.data),
        changeLog: [],
        isDirty: false,
        saving: false
      };

    case "SET_SAVE_STATUS":
      return { ...state, saveStatus: action.status };

    case "AUTO_SAVED": {
      // Keep local data — server response is stale if edits happened during save.
      // Only adopt server metadata (id, status) and mark the saved version.
      const localData = state.dataset?.data ?? action.payload.data;
      const merged: Dataset = { ...action.payload, data: localData };
      return {
        ...state,
        draft: merged,
        dataset: merged,
        changeLog: state.changeLog,
        savedVersion: action.savedVersion,
        saveStatus: "saved",
        lastSavedAt: Date.now()
      };
    }

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
        isDirty: remaining.length > 0,
        mutationVersion: state.mutationVersion + 1
      };
    }

    case "UNDO_ALL": {
      if (!state.dataset || !state.original) return state;
      return {
        ...state,
        dataset: { ...state.dataset, data: structuredClone(state.original) },
        changeLog: [],
        isDirty: false,
        mutationVersion: state.mutationVersion + 1
      };
    }

    case "REVERT_FIELD": {
      if (!state.dataset || !state.live) return state;
      const liveData = state.live.data;
      const { target } = action;
      const data = structuredClone(state.dataset.data);
      let entityLabel = "";
      let fromVal = "";
      let toVal = "";

      if (target.entity === "fact") {
        const orig = liveData.facts[target.key];
        const curr = data.facts[target.key];
        if (orig && curr) {
          fromVal = formatUnknown((curr as Record<string, unknown>)[target.field]);
          toVal = formatUnknown((orig as Record<string, unknown>)[target.field]);
          (curr as Record<string, unknown>)[target.field] = (orig as Record<string, unknown>)[target.field];
          entityLabel = target.key;
        }
      } else if (target.entity === "question") {
        const orig = liveData.questions[target.index];
        const curr = data.questions[target.index];
        if (orig && curr) {
          fromVal = formatUnknown((curr as Record<string, unknown>)[target.field]);
          toVal = formatUnknown((orig as Record<string, unknown>)[target.field]);
          (curr as Record<string, unknown>)[target.field] = (orig as Record<string, unknown>)[target.field];
          entityLabel = `question #${target.index + 1}`;
        }
      } else if (target.entity === "rule") {
        const orig = liveData.rules[target.index];
        const curr = data.rules[target.index];
        if (orig && curr) {
          fromVal = formatUnknown((curr as Record<string, unknown>)[target.field]);
          toVal = formatUnknown((orig as Record<string, unknown>)[target.field]);
          (curr as Record<string, unknown>)[target.field] = (orig as Record<string, unknown>)[target.field];
          entityLabel = `rule #${target.index + 1}`;
        }
      } else if (target.entity === "constant") {
        const origGroup = liveData.constants[target.group] ?? [];
        const currGroup = data.constants[target.group] ?? [];
        const orig = origGroup.find((v) => v.id === target.valueId);
        const currIdx = currGroup.findIndex((v) => v.id === target.valueId);
        const curr = currIdx >= 0 ? currGroup[currIdx] : undefined;
        if (orig && curr) {
          fromVal = formatUnknown((curr as Record<string, unknown>)[target.field]);
          toVal = formatUnknown((orig as Record<string, unknown>)[target.field]);
          const restored = { ...curr, [target.field]: (orig as Record<string, unknown>)[target.field] };
          data.constants = {
            ...data.constants,
            [target.group]: currGroup.map((v) => (v.id === target.valueId ? restored : v))
          };
          entityLabel = `${target.group} / ${curr.name}`;
        }
      }

      const hasChanges = JSON.stringify(data) !== JSON.stringify(liveData);
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
        isDirty: hasChanges,
        mutationVersion: state.mutationVersion + 1
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
        isDirty: true,
        mutationVersion: state.mutationVersion + 1
      };
    }
  }
}
