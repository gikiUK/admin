"use client";

import { Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  hasImage: boolean;
  busy: boolean;
  onPick: () => void;
  onRemove: () => void;
};

export function ImagePanelActions({ hasImage, busy, onPick, onRemove }: Props) {
  return (
    <div className="flex gap-2">
      <Button type="button" variant="outline" onClick={onPick} disabled={busy}>
        <Upload className="size-4" />
        {hasImage ? "Replace image" : "Upload image"}
      </Button>
      {hasImage && (
        <Button type="button" variant="outline" onClick={onRemove} disabled={busy}>
          <Trash2 className="size-4" />
          Remove
        </Button>
      )}
    </div>
  );
}
