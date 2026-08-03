import { getApiUrl } from "@/lib/api/config";

/**
 * Fire-and-forget: enqueues a background job that fans out one sync job per
 * user. The response carries no status — there is no SendgridSync record
 * server-side, so there is nothing to poll.
 */
export async function triggerSendgridSync(): Promise<void> {
  const res = await fetch(getApiUrl("/admin/sendgrid_syncs"), {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    }
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error?.message ?? `API error ${res.status}`);
  }
}
