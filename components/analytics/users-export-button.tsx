"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { MultiCheckGroup } from "@/components/analytics/insights/shared/multi-check-group";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  USER_EXPORT_FIELDS,
  USERS_EXPORT_ENDPOINT,
  type UserExportField,
  type UsersFilter,
  usersExportBody
} from "@/lib/analytics/api";
import { apiDownload } from "@/lib/api/client";

const ALL_FIELDS = USER_EXPORT_FIELDS.map((field) => field.value);

// Exports users matching the active filters; the popover picks which columns.
export function UsersExportButton({ filter }: { filter: UsersFilter }) {
  const [fields, setFields] = useState<UserExportField[]>([...ALL_FIELDS]);
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleDownload() {
    setState("loading");
    setErrorMessage(null);
    try {
      await apiDownload(USERS_EXPORT_ENDPOINT, usersExportBody(filter, fields), "users.csv");
      setState("idle");
    } catch (err) {
      setState("error");
      setErrorMessage(err instanceof Error ? err.message : "Download failed");
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Download className="size-4" />
          Export CSV
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 space-y-3">
        <MultiCheckGroup
          legend="Columns"
          options={[...USER_EXPORT_FIELDS]}
          value={fields}
          onChange={(next) => setFields(next as UserExportField[])}
        />
        <Button className="w-full" size="sm" onClick={handleDownload} disabled={!fields.length || state === "loading"}>
          {state === "loading" ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
          Download
        </Button>
        {state === "error" && errorMessage && <p className="text-xs text-destructive">{errorMessage}</p>}
      </PopoverContent>
    </Popover>
  );
}
