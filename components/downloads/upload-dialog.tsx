"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { type Downloadable, uploadDownloadableFile } from "@/lib/downloads/api";

type UploadDialogProps = {
  downloadable: Downloadable;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded: () => void;
};

export function UploadDialog({ downloadable, open, onOpenChange, onUploaded }: UploadDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  function reset() {
    setFile(null);
    setUploading(false);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      await uploadDownloadableFile(downloadable.key, file);
      onUploaded();
      handleOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload file</DialogTitle>
          <DialogDescription>
            {downloadable.has_file ? "Replace the file for" : "Attach a file to"} <strong>{downloadable.title}</strong>.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.pptx,.xlsx,.png,.jpg,.jpeg,.webp"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            disabled={uploading}
          />
          <p className="text-xs text-muted-foreground">PDF, DOCX, PPTX, XLSX, PNG, JPEG or WEBP. Max 25 MB.</p>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || uploading}>
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
