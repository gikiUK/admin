import { fetchCadenceEmail, fetchCadences, previewCadenceEmail } from "@/lib/cadence-emails/api";
import type { CadenceEmailPayload } from "@/lib/cadence-emails/types";

export const cadenceEmailsKeys = {
  all: ["cadence-emails"] as const,
  list: () => ["cadence-emails", "list"] as const,
  detail: (key: string) => ["cadence-emails", "detail", key] as const,
  preview: (key: string, payload: CadenceEmailPayload) => ["cadence-emails", "preview", key, payload] as const
};

export function cadencesListQuery() {
  return { queryKey: cadenceEmailsKeys.list(), queryFn: fetchCadences };
}

export function cadenceEmailDetailQuery(key: string) {
  return { queryKey: cadenceEmailsKeys.detail(key), queryFn: () => fetchCadenceEmail(key) };
}

/**
 * Keyed on the payload itself, so each distinct set of unsaved values renders
 * once and stays cached while the admin flicks between edits.
 */
export function cadenceEmailPreviewQuery(key: string, payload: CadenceEmailPayload) {
  return {
    queryKey: cadenceEmailsKeys.preview(key, payload),
    queryFn: () => previewCadenceEmail(key, payload),
    staleTime: 5 * 60_000
  };
}
