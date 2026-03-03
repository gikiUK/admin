"use client";

import { useDatasetSafe } from "@/lib/blob/use-dataset";
import { SavedTimeAgo } from "./dataset-header";

export function HeaderSaveStatus() {
  const ctx = useDatasetSafe();
  if (!ctx) return null;
  const { saveStatus, lastSavedAt, loading, isEditing } = ctx.state;

  if (loading || !isEditing) return null;

  return <SavedTimeAgo lastSavedAt={lastSavedAt} saveStatus={saveStatus} />;
}
