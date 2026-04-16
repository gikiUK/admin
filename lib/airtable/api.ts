import { getApiUrl } from "@/lib/api/config";

export type AirtableSync = {
  id: number;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  stats: Record<string, unknown>;
  error_message: string | null;
};

class AirtableApiError extends Error {
  constructor(
    public status: number,
    message?: string
  ) {
    super(message ?? `API error ${status}`);
    this.name = "AirtableApiError";
  }
}

async function airtableApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(getApiUrl(path), {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options?.headers as Record<string, string>)
    },
    ...options
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new AirtableApiError(res.status, body.error?.message);
  }
  return res.json();
}

export async function fetchSyncs(): Promise<AirtableSync[]> {
  const res = await airtableApi<{ airtable_syncs: AirtableSync[] }>("/admin/airtable_syncs");
  return res.airtable_syncs;
}

export async function triggerSync(): Promise<AirtableSync> {
  const res = await airtableApi<{ airtable_sync: AirtableSync }>("/admin/airtable_syncs", {
    method: "POST"
  });
  return res.airtable_sync;
}
