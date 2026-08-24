"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SignupLink } from "@/lib/signup-links/types";
import { ImagePanelActions } from "./image-panel-actions";
import { useImageUpload } from "./use-image-upload";

type Props = {
  link: SignupLink;
};

export function ImagePanel({ link }: Props) {
  const { inputRef, busy, error, pickFile, handleFileChange, remove } = useImageUpload(link.uuid);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Image</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {link.image_url ? (
          // biome-ignore lint/performance/noImgElement: image is served from the API host, not the Next image loader
          <img
            src={link.image_url}
            alt={`${link.title} signup link`}
            className="max-h-64 w-auto rounded-md border object-contain"
          />
        ) : (
          <p className="text-muted-foreground text-sm">No image attached.</p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="sr-only"
          onChange={handleFileChange}
        />
        <ImagePanelActions hasImage={!!link.image_url} busy={busy} onPick={pickFile} onRemove={remove} />
        <p className="text-muted-foreground text-xs">JPEG, PNG, GIF or WebP. Max 5 MB.</p>
        {error && <p className="text-destructive text-sm">{error}</p>}
      </CardContent>
    </Card>
  );
}
