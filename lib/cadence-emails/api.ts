import { getApiUrl } from "@/lib/api/config";
import type { CadenceEmail, CadenceEmailPayload, CadencesResponse } from "@/lib/cadence-emails/types";

type ErrorEnvelope = {
  error?: {
    type?: string;
    message?: string;
    errors?: Record<string, string[]>;
  };
};

/**
 * Local to this feature so the shared `apiFetch` stays untouched: the cadence
 * email endpoints return per-field validation errors on 422, and the shared
 * ApiError keeps only the top-level message.
 */
export class CadenceEmailError extends Error {
  constructor(
    public status: number,
    message: string,
    public fieldErrors: Record<string, string[]> = {}
  ) {
    super(message);
    this.name = "CadenceEmailError";
  }

  isNotFound() {
    return this.status === 404;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(getApiUrl(path), {
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    ...options
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as ErrorEnvelope;
    throw new CadenceEmailError(res.status, body.error?.message ?? `API error ${res.status}`, body.error?.errors ?? {});
  }

  return res.json() as Promise<T>;
}

function path(key: string, suffix = ""): string {
  return `/admin/cadence_emails/${encodeURIComponent(key)}${suffix}`;
}

/** The whole structure — cadences in progression order, each with its emails in send order. */
export function fetchCadences(): Promise<CadencesResponse> {
  return request<CadencesResponse>("/admin/cadences");
}

export function fetchCadenceEmail(key: string): Promise<{ cadence_email: CadenceEmail }> {
  return request<{ cadence_email: CadenceEmail }>(path(key));
}

export function updateCadenceEmail(
  key: string,
  payload: CadenceEmailPayload
): Promise<{ cadence_email: CadenceEmail }> {
  return request<{ cadence_email: CadenceEmail }>(path(key), {
    method: "PATCH",
    body: JSON.stringify({ cadence_email: payload })
  });
}

/** Renders the unsaved values through the real mailer. Persists nothing. */
export function previewCadenceEmail(key: string, payload: CadenceEmailPayload): Promise<{ html: string }> {
  return request<{ html: string }>(path(key, "/preview"), {
    method: "POST",
    body: JSON.stringify({ cadence_email: payload })
  });
}

/** Sends to the logged-in admin. Records nothing, so the real email still arrives later. */
export function sendCadenceEmailTest(key: string): Promise<Record<string, never>> {
  return request<Record<string, never>>(path(key, "/send_test"), { method: "POST" });
}
