"use client";

import { createContext, type Dispatch, type ReactNode, useEffect, useReducer } from "react";
import { loadDataset } from "./api-client";
import { type DatasetAction, type DatasetState, datasetReducer, initialState } from "./dataset-reducer";

type DatasetContextValue = {
  state: DatasetState;
  dispatch: Dispatch<DatasetAction>;
};

export const DatasetContext = createContext<DatasetContextValue | null>(null);

export function DatasetProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(datasetReducer, initialState);

  useEffect(() => {
    loadDataset().then((dataset) => {
      dispatch({ type: "LOAD_DATASET", payload: dataset });
    });
  }, []);

  return <DatasetContext value={{ state, dispatch }}>{children}</DatasetContext>;
}
