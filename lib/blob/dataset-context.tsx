"use client";

import { createContext, type Dispatch, type ReactNode, useEffect, useReducer } from "react";
import { loadDraftDataset, loadLiveDataset } from "./api-client";
import { type DatasetAction, type DatasetState, datasetReducer, initialState } from "./dataset-reducer";
import { useAutoSave } from "./use-auto-save";

type DatasetContextValue = {
  state: DatasetState;
  dispatch: Dispatch<DatasetAction>;
  flushSave: () => Promise<void>;
};

export const DatasetContext = createContext<DatasetContextValue | null>(null);

export function DatasetProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(datasetReducer, initialState);
  const { flushSave } = useAutoSave(state, dispatch);

  useEffect(() => {
    async function load() {
      try {
        const live = await loadLiveDataset();
        dispatch({ type: "LOAD_LIVE", payload: live });

        const draft = await loadDraftDataset();
        if (draft) {
          dispatch({ type: "LOAD_DRAFT", payload: draft });
        }
      } catch {
        // TODO: surface error to UI
      }
    }
    load();
  }, []);

  return <DatasetContext value={{ state, dispatch, flushSave }}>{children}</DatasetContext>;
}
