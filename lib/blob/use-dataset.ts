"use client";

import { useContext } from "react";
import { saveDataset } from "./api-client";
import { DatasetContext } from "./dataset-context";

export function useDataset() {
  const ctx = useContext(DatasetContext);
  if (!ctx) throw new Error("useDataset must be used within a DatasetProvider");

  const { state, dispatch } = ctx;

  async function save() {
    if (!state.dataset) return;
    dispatch({ type: "SET_SAVING", saving: true });
    try {
      await saveDataset(state.dataset.id, {
        data: state.dataset.data,
        test_cases: state.dataset.test_cases
      });
      dispatch({ type: "MARK_SAVED" });
    } catch {
      dispatch({ type: "SET_SAVING", saving: false });
    }
  }

  return {
    dataset: state.dataset,
    blob: state.dataset?.data ?? null,
    dispatch,
    isDirty: state.isDirty,
    saving: state.saving,
    save
  };
}
