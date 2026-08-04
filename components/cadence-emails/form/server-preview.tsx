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
    <div className="relative">
      {stale && (
        <div className="bg-background text-muted-foreground absolute top-2 right-2 z-10 rounded border px-2 py-1 text-xs shadow-sm">
          Rendering…
        </div>
      )}
      <iframe
        title="Email preview"
        srcDoc={query.data?.html ?? ""}
        sandbox=""
        className="h-[700px] w-full rounded-md border bg-white"
      />
    </div>
  );
}
