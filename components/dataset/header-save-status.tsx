"use client";

import { useDataset } from "@/lib/blob/use-dataset";
import { SavedTimeAgo } from "./dataset-header";

export function HeaderSaveStatus() {
  const { saveStatus, lastSavedAt, loading } = useDataset();

  if (loading) return null;

  return <SavedTimeAgo lastSavedAt={lastSavedAt} saveStatus={saveStatus} />;
}
