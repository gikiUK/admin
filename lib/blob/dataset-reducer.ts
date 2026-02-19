import { buildChangeEntry, type ChangeEntry, replayChanges } from "./change-log";
import type { MutationAction } from "./dataset-mutations";
import { applyAction } from "./dataset-mutations";
import { emptyHistory, type HistoryState } from "./history";
import type { Dataset, DatasetData } from "./types";

// ── State ────────────────────────────────────────────────

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export type DatasetState = {
  live: Dataset | null;
  draft: Dataset | null;
  /** The active dataset: draft if editing, otherwise live. */
  dataset: Dataset | null;
  original: DatasetData | null;
  history: HistoryState;
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
  history: emptyHistory,
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
  | { type: "UNDO"; cursor: number }
  | { type: "REDO"; cursor: number }
  | { type: "REVERT_FIELD"; target: RevertFieldTarget }
  | { type: "RESTORE_HISTORY"; history: HistoryState }
  | { type: "CLEAR_HISTORY" }
  | { type: "SET_SAVING"; saving: boolean }
  | { type: "MARK_SAVED"; payload: Dataset }
  | { type: "SET_SAVE_STATUS"; status: SaveStatus }
  | { type: "AUTO_SAVED"; payload: Dataset; savedVersion: number };

// ── Helpers ──────────────────────────────────────────────

export function isMutationAction(action: DatasetAction): action is MutationAction {
  return (
    action.type === "SET_FACT" ||
    action.type === "ADD_FACT" ||
    action.type === "DISCARD_FACT" ||
    action.type === "RESTORE_FACT" ||
    action.type === "SET_RULE" ||
    action.type === "ADD_RULE" ||
    action.type === "DISCARD_RULE" ||
    action.type === "RESTORE_RULE" ||
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

/** Replay entries[0..cursor] from history base to produce dataset data. */
function replayToCursor(history: HistoryState): DatasetData | null {
  if (!history.base) return null;
  const applied = history.entries.slice(0, history.cursor + 1);
  return replayChanges(structuredClone(history.base), applied);
}

/** Build a replayable SET_* mutation that reverts a single field to its live value. */
function buildRevertMutation(
  target: RevertFieldTarget,
  currentData: DatasetData,
  liveData: DatasetData
): MutationAction | null {
  if (target.entity === "fact") {
    const orig = liveData.facts[target.key];
    const curr = currentData.facts[target.key];
    if (!orig || !curr) return null;
    const reverted = { ...curr, [target.field]: (orig as Record<string, unknown>)[target.field] };
    return { type: "SET_FACT", id: target.key, fact: reverted };
  }
  if (target.entity === "question") {
    const orig = liveData.questions[target.index];
    const curr = currentData.questions[target.index];
    if (!orig || !curr) return null;
    const reverted = { ...curr, [target.field]: (orig as Record<string, unknown>)[target.field] };
    return { type: "SET_QUESTION", index: target.index, question: reverted };
  }
  if (target.entity === "rule") {
    const orig = liveData.rules[target.index];
    const curr = currentData.rules[target.index];
    if (!orig || !curr) return null;
    const reverted = { ...curr, [target.field]: (orig as Record<string, unknown>)[target.field] };
    return { type: "SET_RULE", index: target.index, rule: reverted };
  }
  if (target.entity === "constant") {
    const origGroup = liveData.constants[target.group] ?? [];
    const currGroup = currentData.constants[target.group] ?? [];
    const orig = origGroup.find((v) => v.id === target.valueId);
    const curr = currGroup.find((v) => v.id === target.valueId);
    if (!orig || !curr) return null;
    const reverted = { ...curr, [target.field]: (orig as Record<string, unknown>)[target.field] };
    return { type: "SET_CONSTANT_VALUE", group: target.group, valueId: target.valueId, value: reverted };
  }
  return null;
}

/** Append a new entry to history. Lifecycle entries are inserted without truncating or moving cursor. */
function appendToHistory(history: HistoryState, entry: ChangeEntry, currentData: DatasetData): HistoryState {
  const base = history.base ?? structuredClone(currentData);
  if (entry.isLifecycle) {
    // Lifecycle markers don't truncate future entries or move the cursor
    return { entries: [...history.entries, entry], cursor: history.cursor, base };
  }
  const entries = [...history.entries.slice(0, history.cursor + 1), entry];
  return { entries, cursor: entries.length - 1, base };
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
        isDirty: state.live ? JSON.stringify(state.live.data) !== JSON.stringify(action.payload.data) : false,
        isEditing: true
      };

    case "DRAFT_CREATING":
      return { ...state, draftCreating: true };

    case "DRAFT_CREATE_FAILED":
      return { ...state, draftCreating: false, pendingMutations: [] };

    case "DRAFT_CREATED": {
      // Replay any mutations that were queued while draft was being created
      const serverData = action.payload.data;
      let data = serverData;
      const newEntries: ChangeEntry[] = [];
      for (const mutation of state.pendingMutations) {
        newEntries.push(buildChangeEntry(mutation, data));
        data = applyAction(data, mutation);
      }
      const hasPending = state.pendingMutations.length > 0;

      // If data was already modified (e.g., by undo/redo from live mode), keep the local data
      const localData = state.dataset?.data;
      const liveData = state.live?.data;
      const hasLocalChanges = localData && liveData && JSON.stringify(localData) !== JSON.stringify(liveData);
      if (!hasPending && hasLocalChanges) {
        data = localData;
      }
      const isDirty = hasPending || !!hasLocalChanges;

      const prevEntries = state.history.entries.slice(0, state.history.cursor + 1);
      const futureEntries = state.history.entries.slice(state.history.cursor + 1);
      const base = state.history.base ?? (isDirty ? structuredClone(serverData) : null);
      const history: HistoryState = {
        entries: [...prevEntries, ...newEntries, ...futureEntries],
        cursor: state.history.cursor + newEntries.length,
        base
      };
      return {
        ...state,
        draft: { ...action.payload, data },
        dataset: { ...action.payload, data },
        original: liveData ? structuredClone(liveData) : structuredClone(serverData),
        history,
        isDirty,
        isEditing: true,
        draftCreating: false,
        pendingMutations: [],
        mutationVersion: isDirty ? state.mutationVersion + 1 : state.mutationVersion
      };
    }

    case "DRAFT_DELETED": {
      // If the cursor already points at a discard entry (e.g. we redo'd to it),
      // the auto-drop is just a side effect of history traversal — don't duplicate.
      const currentEntry = state.history.entries[state.history.cursor];
      const alreadyAtDiscard = currentEntry?.isDiscard === true;
      const hist = alreadyAtDiscard
        ? state.history
        : appendToHistory(
            state.history,
            {
              id: crypto.randomUUID(),
              timestamp: Date.now(),
              action: null,
              description: "Discarded draft",
              details: [],
              isDiscard: true
            },
            state.dataset?.data ?? ({} as DatasetData)
          );
      return {
        ...state,
        draft: null,
        dataset: state.live,
        original: state.live ? structuredClone(state.live.data) : null,
        isDirty: false,
        isEditing: false,
        history: hist
      };
    }

    case "DRAFT_PUBLISHED": {
      const publishEntry: ChangeEntry = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        action: null,
        description: "Published to live",
        details: [],
        isLifecycle: true
      };
      const hist = appendToHistory(state.history, publishEntry, state.dataset?.data ?? ({} as DatasetData));
      return {
        ...state,
        live: action.payload,
        draft: null,
        dataset: action.payload,
        original: structuredClone(action.payload.data),
        isDirty: false,
        saving: false,
        isEditing: false,
        history: { ...hist, cursor: hist.entries.length - 1 }
      };
    }

    case "QUEUE_MUTATION":
      return { ...state, pendingMutations: [...state.pendingMutations, action.mutation] };

    case "MARK_SAVED":
      return {
        ...state,
        draft: action.payload,
        dataset: action.payload,
        original: state.live ? structuredClone(state.live.data) : structuredClone(action.payload.data),
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
        savedVersion: action.savedVersion,
        saveStatus: "saved",
        lastSavedAt: Date.now()
      };
    }

    case "SET_SAVING":
      return { ...state, saving: action.saving };

    case "UNDO": {
      const base = state.history.base;
      if (!state.dataset || !base) return state;
      const cursor = Math.max(-1, Math.min(action.cursor, state.history.entries.length - 1));
      if (cursor >= state.history.cursor) return state;
      const history = { ...state.history, cursor };
      const data = cursor === -1 ? structuredClone(base) : (replayToCursor(history) ?? state.dataset.data);
      const liveData = state.live?.data;
      const isDirty = liveData ? JSON.stringify(data) !== JSON.stringify(liveData) : cursor >= 0;
      return {
        ...state,
        dataset: { ...state.dataset, data },
        history,
        isDirty,
        mutationVersion: state.mutationVersion + 1
      };
    }

    case "REDO": {
      if (!state.dataset || !state.history.base) return state;
      const cursor = Math.max(-1, Math.min(action.cursor, state.history.entries.length - 1));
      if (cursor <= state.history.cursor) return state;
      const history = { ...state.history, cursor };
      const data = replayToCursor(history) ?? state.dataset.data;
      const liveData = state.live?.data;
      const isDirty = liveData ? JSON.stringify(data) !== JSON.stringify(liveData) : true;
      return {
        ...state,
        dataset: { ...state.dataset, data },
        history,
        isDirty,
        mutationVersion: state.mutationVersion + 1
      };
    }

    case "RESTORE_HISTORY": {
      if (!state.dataset) return state;
      const { history } = action;
      if (!history.base) return { ...state, history };
      // Discard stale history if base doesn't match current live data
      const liveData = state.live?.data;
      if (liveData && JSON.stringify(history.base) !== JSON.stringify(liveData)) {
        return state;
      }
      // Clamp cursor to valid range
      const cursor = Math.max(-1, Math.min(history.cursor, history.entries.length - 1));
      const clamped: HistoryState = { entries: history.entries, cursor, base: history.base };
      const data = cursor === -1 ? structuredClone(history.base) : (replayToCursor(clamped) ?? state.dataset.data);
      const isDirty = liveData ? JSON.stringify(data) !== JSON.stringify(liveData) : cursor >= 0;
      return {
        ...state,
        dataset: { ...state.dataset, data },
        history: clamped,
        isDirty,
        mutationVersion: state.mutationVersion + 1
      };
    }

    case "CLEAR_HISTORY":
      return { ...state, history: emptyHistory };

    case "REVERT_FIELD": {
      if (!state.dataset || !state.live) return state;
      const mutation = buildRevertMutation(target(action), state.dataset.data, state.live.data);
      if (!mutation) return state;
      // Treat the revert as a normal mutation — append to history, truncate future
      const entry = buildChangeEntry(mutation, state.dataset.data);
      entry.isRevert = true;
      const data = applyAction(state.dataset.data, mutation);
      const liveData = state.live.data;
      const isDirty = JSON.stringify(data) !== JSON.stringify(liveData);
      return {
        ...state,
        dataset: { ...state.dataset, data },
        history: appendToHistory(state.history, entry, state.dataset.data),
        isDirty,
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
        history: appendToHistory(state.history, entry, state.dataset.data),
        isDirty: true,
        mutationVersion: state.mutationVersion + 1
      };
    }
  }
}

function target(action: { target: RevertFieldTarget }): RevertFieldTarget {
  return action.target;
}
