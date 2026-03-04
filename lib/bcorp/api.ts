import { getApiUrl } from "@/lib/api/config";
import type { BcorpData, Organization, Plan } from "./types";

class BcorpApiError extends Error {
  constructor(
    public status: number,
    message?: string
  ) {
    super(message ?? `API error ${status}`);
    this.name = "BcorpApiError";
  }
}

function getJitToken(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("jit");
}

async function bcorpApi<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options?.headers as Record<string, string>)
  };
  const jit = getJitToken();
  if (jit) {
    headers["X-JIT-Token"] = jit;
  }
  const res = await fetch(getApiUrl(path), {
    credentials: "include",
    headers,
    ...options
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new BcorpApiError(res.status, body.error?.message);
  }
  return res.json();
}

export async function fetchOrganizations(): Promise<Organization[]> {
  const res = await bcorpApi<{ data: Organization[] }>("/admin/legacy/organizations");
  return res.data;
}

export async function fetchPlan(orgId: string): Promise<Plan> {
  const res = await bcorpApi<{ data: Plan } | Plan>(`/admin/legacy/organizations/${orgId}/plan`);
  const raw = Array.isArray(res) ? res : ((res as { data: Plan }).data ?? []);
  return raw.filter((a) => a.tal_action !== null);
}

export async function fetchBcorpData(orgId: string): Promise<BcorpData> {
  const res = await bcorpApi<{ bcorp_data: BcorpData }>(`/admin/legacy/organizations/${orgId}/bcorp_data`);
  return res.bcorp_data;
}

export async function patchBcorpData(orgId: string, data: BcorpData): Promise<BcorpData> {
  const res = await bcorpApi<{ bcorp_data: BcorpData }>(`/admin/legacy/organizations/${orgId}/bcorp_data`, {
    method: "PATCH",
    body: JSON.stringify({ bcorp_data: data })
  });
  return res.bcorp_data;
}
