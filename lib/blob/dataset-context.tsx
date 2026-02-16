"use client";

import { createContext, type Dispatch, type ReactNode, useEffect, useReducer } from "react";
import { loadDraftDataset, loadLiveDataset } from "./api-client";
import { type DatasetAction, type DatasetState, datasetReducer, initialState } from "./dataset-reducer";

type DatasetContextValue = {
  state: DatasetState;
  dispatch: Dispatch<DatasetAction>;
};

export const DatasetContext = createContext<DatasetContextValue | null>(null);

export function DatasetProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(datasetReducer, initialState);

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

  return <DatasetContext value={{ state, dispatch }}>{children}</DatasetContext>;
}
