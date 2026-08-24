"use client";

import type { SignupLink } from "@/lib/signup-links/types";
import { ImageActions } from "./image-actions";
import { ImagePreview } from "./image-preview";
import { useImageUpload } from "./use-image-upload";

type Props = {
  link: SignupLink;
};

/** Image for a link that already exists — every change saves immediately. */
export function ExistingImageField({ link }: Props) {
  const { inputRef, busy, error, pickFile, handleFileChange, remove } = useImageUpload(link.uuid);

  return (
    <>
      {link.image_url && <ImagePreview src={link.image_url} alt="Welcome page" />}
      <input
        id="welcome_page_image"
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="sr-only"
        onChange={handleFileChange}
      />
      <ImageActions hasImage={!!link.image_url} busy={busy} onPick={pickFile} onRemove={remove} />
      {error && <p className="text-destructive text-sm">{error}</p>}
    </>
  );
}
