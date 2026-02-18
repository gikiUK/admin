"use client";

import { createContext, type Dispatch, type ReactNode, useCallback, useEffect, useReducer, useRef } from "react";
import { deleteDraft as apiDeleteDraft, loadDraftDataset, loadLiveDataset } from "./api-client";
import { type DatasetAction, type DatasetState, datasetReducer, initialState } from "./dataset-reducer";
import { clearHistory, loadHistory, saveHistory } from "./history";
import { useAutoSave } from "./use-auto-save";

type DatasetContextValue = {
  state: DatasetState;
  dispatch: Dispatch<DatasetAction>;
  flushSave: () => Promise<void>;
  holdDraftDrop: () => void;
  releaseDraftDrop: () => void;
};

export const DatasetContext = createContext<DatasetContextValue | null>(null);

export function DatasetProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(datasetReducer, initialState);
  const { flushSave } = useAutoSave(state, dispatch);
  const droppingRef = useRef(false);
  const holdCountRef = useRef(0);
  const pendingDropRef = useRef(false);
  const historyRestoredRef = useRef(false);

  // Load live + draft, then restore history from localStorage
  useEffect(() => {
    async function load() {
      try {
        const live = await loadLiveDataset();
        dispatch({ type: "LOAD_LIVE", payload: live });

        const draft = await loadDraftDataset();
        if (draft) {
          dispatch({ type: "LOAD_DRAFT", payload: draft });
        }

        // Restore history after both live and draft are loaded
        const saved = loadHistory();
        if (saved && saved.entries.length > 0) {
          dispatch({ type: "RESTORE_HISTORY", history: saved });
        }
        historyRestoredRef.current = true;
      } catch {
        // TODO: surface error to UI
        historyRestoredRef.current = true;
      }
    }
    load();
  }, []);

  // Persist history to localStorage on changes
  useEffect(() => {
    if (!historyRestoredRef.current) return;
    if (state.history.entries.length === 0) {
      clearHistory();
    } else {
      saveHistory(state.history);
    }
  }, [state.history]);

  const doDrop = useCallback(() => {
    if (droppingRef.current) return;
    droppingRef.current = true;
    apiDeleteDraft()
      .then(() => dispatch({ type: "DRAFT_DELETED" }))
      .catch(() => {})
      .finally(() => {
        droppingRef.current = false;
        pendingDropRef.current = false;
      });
  }, []);

  // Auto-drop draft when data matches live (no real diff)
  const hasRealDiff =
    state.isEditing && state.live && state.dataset
      ? JSON.stringify(state.live.data) !== JSON.stringify(state.dataset.data)
      : true;

  useEffect(() => {
    if (!state.isEditing || hasRealDiff || state.saving || state.draftCreating) {
      pendingDropRef.current = false;
      return;
    }
    if (holdCountRef.current > 0) {
      pendingDropRef.current = true;
      return;
    }
    doDrop();
  }, [state.isEditing, hasRealDiff, state.saving, state.draftCreating, doDrop]);

  const holdDraftDrop = useCallback(() => {
    holdCountRef.current++;
  }, []);

  const releaseDraftDrop = useCallback(() => {
    holdCountRef.current = Math.max(0, holdCountRef.current - 1);
    if (holdCountRef.current === 0 && pendingDropRef.current) {
      doDrop();
    }
  }, [doDrop]);

  return (
    <DatasetContext value={{ state, dispatch, flushSave, holdDraftDrop, releaseDraftDrop }}>{children}</DatasetContext>
  );
}
