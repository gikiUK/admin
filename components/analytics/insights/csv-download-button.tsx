"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { apiDownload } from "@/lib/api/client";

type Props = {
  /** Admin API path, e.g. "/admin/analytics/insights/facts/export". */
  endpoint: string;
  /** JSON body to POST (e.g. the CohortSpec). */
  body: unknown;
  /** Used if the server omits a content-disposition filename. */
  fallbackFilename: string;
  label?: string;
  disabled?: boolean;
};

export function CsvDownloadButton({ endpoint, body, fallbackFilename, label = "Download CSV", disabled }: Props) {
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleClick() {
    setState("loading");
    setErrorMessage(null);
    try {
      await apiDownload(endpoint, body, fallbackFilename);
      setState("idle");
    } catch (err) {
      setState("error");
      setErrorMessage(err instanceof Error ? err.message : "Download failed");
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="outline" size="sm" onClick={handleClick} disabled={disabled || state === "loading"}>
        {state === "loading" ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        {label}
      </Button>
      {state === "error" && errorMessage && <span className="text-xs text-destructive">{errorMessage}</span>}
    </div>
  );
}
