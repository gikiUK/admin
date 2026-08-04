"use client";

import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@/components/cadence-emails/form/use-debounced-value";
import { cadenceEmailPreviewQuery } from "@/lib/cadence-emails/queries";
import type { CadenceEmailPayload } from "@/lib/cadence-emails/types";

const PREVIEW_DELAY_MS = 500;

type Props = {
  emailKey: string;
  payload: CadenceEmailPayload;
};

/**
 * Rails renders the unsaved values through the real mailer, so this is exactly
 * what sends — header, greeting, signoff and unsubscribe links included. We
 * debounce a serialised payload (strings settle; a fresh object every render
 * would not) and let react-query cache each distinct set of values.
 */
export function ServerPreview({ emailKey, payload }: Props) {
  const debouncedJson = useDebouncedValue(JSON.stringify(payload), PREVIEW_DELAY_MS);
  const debouncedPayload = JSON.parse(debouncedJson) as CadenceEmailPayload;
  const query = useQuery(cadenceEmailPreviewQuery(emailKey, debouncedPayload));

  const stale = debouncedJson !== JSON.stringify(payload) || query.isFetching;

  if (query.isError) {
    return (
      <p className="text-destructive text-sm">
        {query.error instanceof Error ? query.error.message : "Failed to render preview"}
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border">
      <div className="bg-muted text-muted-foreground relative flex items-center border-b px-3 py-1.5">
        <span className="w-full text-center text-xs font-bold uppercase">Preview</span>
        {stale && <span className="absolute right-3 text-xs">Rendering…</span>}
      </div>
      <iframe title="Email preview" srcDoc={query.data?.html ?? ""} sandbox="" className="h-[700px] w-full bg-white" />
    </div>
  );
}
