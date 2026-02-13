"use server";

import { getConstantGroupNames } from "@/lib/data/constants";
import { getDataset, saveDataset as saveMockDataset } from "./mock-store";
import type { Dataset, DatasetBlob } from "./types";

export async function fetchDataset(): Promise<Dataset> {
  return getDataset();
}

export async function persistDataset(_id: string, blob: DatasetBlob): Promise<void> {
  saveMockDataset(blob);
}

export async function fetchConstantGroupNames(): Promise<string[]> {
  return getConstantGroupNames();
}
