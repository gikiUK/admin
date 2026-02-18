"use client";

import { useCallback, useContext } from "react";
import {
  ApiError,
  createDraft as apiCreateDraft,
  deleteDraft as apiDeleteDraft,
  publishDraft as apiPublishDraft
} from "./api-client";
import { DatasetContext } from "./dataset-context";
import type { DatasetAction, RevertFieldTarget } from "./dataset-reducer";
import { isMutationAction } from "./dataset-reducer";

export function useDataset() {
  const ctx = useContext(DatasetContext);
  if (!ctx) throw new Error("useDataset must be used within a DatasetProvider");

  const { state, dispatch, flushSave, holdDraftDrop, releaseDraftDrop } = ctx;

  // Smart dispatch: auto-creates draft on first mutation
  const smartDispatch = useCallback(
    (action: DatasetAction) => {
      if (!isMutationAction(action)) {
        dispatch(action);
        return;
      }

      // Draft exists → dispatch normally
      if (state.isEditing && !state.draftCreating) {
        dispatch(action);
        return;
      }

      // Draft is being created → queue mutation
      if (state.draftCreating) {
        dispatch({ type: "QUEUE_MUTATION", mutation: action });
        return;
      }

      // No draft → queue mutation + auto-create draft
      dispatch({ type: "QUEUE_MUTATION", mutation: action });
      dispatch({ type: "DRAFT_CREATING" });

      apiCreateDraft()
        .then((draft) => {
          dispatch({ type: "DRAFT_CREATED", payload: draft });
        })
        .catch((err) => {
          dispatch({ type: "DRAFT_CREATE_FAILED" });
          if (err instanceof ApiError) console.error("Failed to create draft:", err.message);
        });
    },
    [dispatch, state.isEditing, state.draftCreating]
  );

  async function deleteDraftAction() {
    await apiDeleteDraft();
    dispatch({ type: "DRAFT_DELETED" });
  }

  async function publish() {
    dispatch({ type: "SET_SAVING", saving: true });
    try {
      await flushSave();
      const live = await apiPublishDraft();
      dispatch({ type: "DRAFT_PUBLISHED", payload: live });
    } catch (err) {
      dispatch({ type: "SET_SAVING", saving: false });
      throw err;
    }
  }

  const { history } = state;
  const canUndo = history.cursor >= 0;
  const canRedo = history.cursor < history.entries.length - 1;

  // Ensure a draft exists when data will differ from live after undo/redo
  const ensureDraft = useCallback(() => {
    if (state.isEditing || state.draftCreating) return;
    dispatch({ type: "DRAFT_CREATING" });
    apiCreateDraft()
      .then((draft) => dispatch({ type: "DRAFT_CREATED", payload: draft }))
      .catch((err) => {
        dispatch({ type: "DRAFT_CREATE_FAILED" });
        if (err instanceof ApiError) console.error("Failed to create draft:", err.message);
      });
  }, [dispatch, state.isEditing, state.draftCreating]);

  function undo() {
    if (!canUndo) return;
    dispatch({ type: "UNDO", cursor: history.cursor - 1 });
    // If we're undoing to a point that still differs from live, ensure draft exists
    if (history.cursor - 1 >= 0) ensureDraft();
  }

  function redo() {
    if (!canRedo) return;
    dispatch({ type: "REDO", cursor: history.cursor + 1 });
    ensureDraft();
  }

  function travelTo(cursor: number) {
    if (cursor < history.cursor) {
      dispatch({ type: "UNDO", cursor });
      if (cursor >= 0) ensureDraft();
    } else if (cursor > history.cursor) {
      dispatch({ type: "REDO", cursor });
      ensureDraft();
    }
  }

  function revertField(target: RevertFieldTarget) {
    dispatch({ type: "REVERT_FIELD", target });
  }

  function clearHistory() {
    dispatch({ type: "CLEAR_HISTORY" });
  }

  return {
    dataset: state.dataset,
    blob: state.dataset?.data ?? null,
    dispatch: smartDispatch,
    isDirty: state.isDirty,
    saving: state.saving,
    loading: state.loading,
    history: state.history,
    original: state.original,
    undo,
    redo,
    travelTo,
    canUndo,
    canRedo,
    revertField,
    clearHistory,
    // Draft/live workflow
    live: state.live,
    draft: state.draft,
    isEditing: state.isEditing,
    deleteDraft: deleteDraftAction,
    publish,
    flushSave,
    // Auto-save status
    saveStatus: state.saveStatus,
    lastSavedAt: state.lastSavedAt,
    // Draft drop hold (for dialogs that revert changes)
    holdDraftDrop,
    releaseDraftDrop
  };
}
