"use client";

import { useDataset } from "@/lib/blob/use-dataset";
import { SavedTimeAgo } from "./dataset-header";

export function HeaderSaveStatus() {
  const { saveStatus, lastSavedAt, loading, isEditing } = useDataset();

  if (loading || !isEditing) return null;

  return <SavedTimeAgo lastSavedAt={lastSavedAt} saveStatus={saveStatus} />;
}
