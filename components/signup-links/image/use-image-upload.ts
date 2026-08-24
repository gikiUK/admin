import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { deleteSignupLinkImage, uploadSignupLinkImage } from "@/lib/signup-links/api";
import { signupLinksKeys } from "@/lib/signup-links/queries";
import type { SignupLink } from "@/lib/signup-links/types";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) return "Image must be a JPEG, PNG, GIF or WebP.";
  if (file.size > MAX_IMAGE_BYTES) return "Image must be 5 MB or smaller.";
  return null;
}

export function useImageUpload(uuid: string) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function cacheUpdated(res: { signup_link: SignupLink }) {
    queryClient.setQueryData(signupLinksKeys.detail(uuid), res);
    queryClient.invalidateQueries({ queryKey: signupLinksKeys.all });
  }

  async function run(action: () => Promise<{ signup_link: SignupLink }>, successMessage: string, fallback: string) {
    setBusy(true);
    setError("");
    try {
      cacheUpdated(await action());
      toast.success(successMessage);
    } catch (err) {
      setError(err instanceof Error ? err.message : fallback);
    } finally {
      setBusy(false);
    }
  }

  function pickFile() {
    inputRef.current?.click();
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const invalid = validateImageFile(file);
    if (invalid) {
      setError(invalid);
      return;
    }
    await run(() => uploadSignupLinkImage(uuid, file), "Image uploaded.", "Upload failed");
  }

  async function remove() {
    await run(() => deleteSignupLinkImage(uuid), "Image removed.", "Removing the image failed");
  }

  return { inputRef, busy, error, pickFile, handleFileChange, remove };
}
