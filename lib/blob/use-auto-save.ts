"use client";

import type { Dispatch } from "react";
import { useCallback, useEffect, useRef } from "react";
import { saveDraft } from "./api-client";
import type { DatasetAction, DatasetState } from "./dataset-reducer";

const DEBOUNCE_MS = 1500;

export function useAutoSave(state: DatasetState, dispatch: Dispatch<DatasetAction>) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const doSave = useCallback(async () => {
    const { dataset, isDirty, isEditing } = stateRef.current;
    if (!dataset || !isDirty || !isEditing) return;

    dispatch({ type: "SET_SAVE_STATUS", status: "saving" });
    try {
      const updated = await saveDraft({ data: dataset.data, test_cases: dataset.test_cases });
      dispatch({ type: "AUTO_SAVED", payload: updated });
    } catch {
      dispatch({ type: "SET_SAVE_STATUS", status: "error" });
    }
  }, [dispatch]);

  // Restart debounce timer on each mutation
  const { mutationVersion } = state;
  useEffect(() => {
    if (mutationVersion === 0) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(doSave, DEBOUNCE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [mutationVersion, doSave]);

  const flushSave = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    await doSave();
  }, [doSave]);

  return { flushSave };
}
