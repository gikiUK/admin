"use client";

import type { Dispatch } from "react";
import { useCallback, useEffect, useRef } from "react";
import { saveDraft } from "./api-client";
import type { DatasetAction, DatasetState } from "./dataset-reducer";

/**
 * Small batch window to coalesce near-simultaneous mutations
 * (e.g. multiple dispatches from a single user action).
 */
const BATCH_MS = 80;

export function useAutoSave(state: DatasetState, dispatch: Dispatch<DatasetAction>) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  const doSave = useCallback(async () => {
    const { dataset, mutationVersion, savedVersion, isEditing } = stateRef.current;
    if (!dataset || !isEditing || mutationVersion <= savedVersion) return;
    if (savingRef.current) return; // another save in flight — will re-check after

    savingRef.current = true;
    const savingVersion = mutationVersion;
    dispatch({ type: "SET_SAVE_STATUS", status: "saving" });
    try {
      const updated = await saveDraft({ data: dataset.data, test_cases: dataset.test_cases });
      dispatch({ type: "AUTO_SAVED", payload: updated, savedVersion: savingVersion });
    } catch {
      dispatch({ type: "SET_SAVE_STATUS", status: "error" });
    } finally {
      savingRef.current = false;
      // If more mutations arrived while saving, save again
      if (stateRef.current.mutationVersion > savingVersion) {
        doSave();
      }
    }
  }, [dispatch]);

  // Save shortly after each mutation (batch window only)
  const { mutationVersion } = state;
  useEffect(() => {
    if (mutationVersion === 0) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(doSave, BATCH_MS);
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
