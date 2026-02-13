import { seedFromDisk } from "./seed";
import type { Dataset, DatasetBlob } from "./types";

let dataset: Dataset | null = null;

function ensureSeeded(): Dataset {
  if (!dataset) {
    const blob = seedFromDisk();
    const now = new Date().toISOString();
    dataset = {
      id: "mock-1",
      status: "live",
      created_at: now,
      updated_at: now,
      ...blob
    };
  }
  return dataset;
}

export function getDataset(): Dataset {
  return ensureSeeded();
}

export function saveDataset(blob: DatasetBlob): void {
  const current = ensureSeeded();
  dataset = {
    ...current,
    ...blob,
    updated_at: new Date().toISOString()
  };
}
