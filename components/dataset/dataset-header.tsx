"use client";

import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDataset } from "@/lib/blob/use-dataset";

export function DatasetHeader() {
  const { isDirty, saving, save } = useDataset();

  if (!isDirty && !saving) return null;

  return (
    <div className="flex items-center gap-2">
      {isDirty && <span className="text-xs text-amber-600">Unsaved changes</span>}
      <Button size="sm" onClick={save} disabled={saving}>
        {saving ? <Loader2 className="size-3 animate-spin" /> : <Save className="size-3" />}
        {saving ? "Saving..." : "Save"}
      </Button>
    </div>
  );
}
