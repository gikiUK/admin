"use client";

import { useContext } from "react";
import {
  ApiError,
  createDraft as apiCreateDraft,
  deleteDraft as apiDeleteDraft,
  publishDraft as apiPublishDraft,
  saveDraft
} from "./api-client";
import { DatasetContext } from "./dataset-context";
import type { RevertFieldTarget } from "./dataset-reducer";

export function useDataset() {
  const ctx = useContext(DatasetContext);
  if (!ctx) throw new Error("useDataset must be used within a DatasetProvider");

  const { state, dispatch } = ctx;

  async function save() {
    if (!state.dataset) return;
    dispatch({ type: "SET_SAVING", saving: true });
    try {
      const updated = await saveDraft({
        data: state.dataset.data,
        test_cases: state.dataset.test_cases
      });
      dispatch({ type: "MARK_SAVED", payload: updated });
    } catch (err) {
      dispatch({ type: "SET_SAVING", saving: false });
      throw err;
    }
  }

  async function createDraft() {
    try {
      const draft = await apiCreateDraft();
      dispatch({ type: "DRAFT_CREATED", payload: draft });
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw err;
    }
  }

  async function deleteDraftAction() {
    await apiDeleteDraft();
    dispatch({ type: "DRAFT_DELETED" });
  }

  async function publish() {
    dispatch({ type: "SET_SAVING", saving: true });
    try {
      const live = await apiPublishDraft();
      dispatch({ type: "DRAFT_PUBLISHED", payload: live });
    } catch (err) {
      dispatch({ type: "SET_SAVING", saving: false });
      throw err;
    }
  }

  function undoChange(entryId: string) {
    dispatch({ type: "UNDO_CHANGE", entryId });
  }

  function undoAll() {
    dispatch({ type: "UNDO_ALL" });
  }

  function revertField(target: RevertFieldTarget) {
    dispatch({ type: "REVERT_FIELD", target });
  }

  return {
    dataset: state.dataset,
    blob: state.dataset?.data ?? null,
    dispatch,
    isDirty: state.isDirty,
    saving: state.saving,
    loading: state.loading,
    save,
    changeLog: state.changeLog,
    original: state.original,
    undoChange,
    undoAll,
    revertField,
    // Draft/live workflow
    live: state.live,
    draft: state.draft,
    isEditing: state.isEditing,
    createDraft,
    deleteDraft: deleteDraftAction,
    publish
  };
}
