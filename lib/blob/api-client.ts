import { fetchDataset, persistDataset } from "./actions";
import type { Dataset, DatasetBlob } from "./types";

// In production these become fetch() calls to the Rails API.
// For now they call server actions that wrap the mock store.

export async function loadDataset(): Promise<Dataset> {
  return fetchDataset();
}

export async function saveDataset(id: string, blob: DatasetBlob): Promise<void> {
  await persistDataset(id, blob);
}
