"use client";

import { Label } from "@/components/ui/label";
import type { SignupLink } from "@/lib/signup-links/types";
import { ExistingImageField } from "./existing-image-field";
import { PendingImageField } from "./pending-image-field";

type Props = {
  link: SignupLink | null;
  pendingFile: File | null;
  onPendingFileChange: (file: File | null) => void;
};

/**
 * Optional image for the welcome page. It has its own endpoint rather than
 * living in the signup_link payload, so an existing link uploads immediately
 * while a brand-new one holds the file until the link has been created.
 */
export function WelcomePageImageField({ link, pendingFile, onPendingFileChange }: Props) {
  return (
    <div className="space-y-2">
      <Label htmlFor="welcome_page_image">Image (optional)</Label>
      {link ? (
        <ExistingImageField link={link} />
      ) : (
        <PendingImageField file={pendingFile} onFileChange={onPendingFileChange} />
      )}
      <p className="text-xs text-muted-foreground">JPEG, PNG, GIF or WebP. Max 5 MB.</p>
    </div>
  );
}
