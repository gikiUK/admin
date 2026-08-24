"use client";

import { useEffect, useRef, useState } from "react";
import { ImageActions } from "./image-actions";
import { ImagePreview } from "./image-preview";
import { validateImageFile } from "./use-image-upload";

type Props = {
  file: File | null;
  onFileChange: (file: File | null) => void;
};

/**
 * Image for a link that doesn't exist yet. There's no uuid to upload against,
 * so the file is held locally and uploaded by the page once the link has been
 * created.
 */
export function PendingImageField({ file, onFileChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const previewUrl = useObjectUrl(file);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0];
    event.target.value = "";
    if (!picked) return;

    const invalid = validateImageFile(picked);
    setError(invalid ?? "");
    onFileChange(invalid ? null : picked);
  }

  function remove() {
    setError("");
    onFileChange(null);
  }

  return (
    <>
      {previewUrl && <ImagePreview src={previewUrl} alt="Welcome page" />}
      <input
        id="welcome_page_image"
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="sr-only"
        onChange={handleFileChange}
      />
      <ImageActions hasImage={!!file} busy={false} onPick={() => inputRef.current?.click()} onRemove={remove} />
      {file && <p className="text-xs text-muted-foreground">Uploads when the link is created.</p>}
      {error && <p className="text-destructive text-sm">{error}</p>}
    </>
  );
}

function useObjectUrl(file: File | null): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  return url;
}
