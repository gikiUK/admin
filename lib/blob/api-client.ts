import type { Action, Dataset, DatasetBlob } from "./types";

// Requests go through Next.js rewrites (/api/* → Rails API) to avoid CORS.
// In the browser this is same-origin; no cross-origin headers needed.
const API_URL = "/api";

// ── Error type ──────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public status: number,
    public errorType?: string,
    serverMessage?: string
  ) {
    super(serverMessage ?? `API error ${status}: ${errorType ?? "unknown"}`);
    this.name = "ApiError";
  }

  get isNotFound() {
    return this.status === 404;
  }

  get isUnauthorized() {
    return this.status === 401 || this.status === 403;
  }
}

// ── Base fetch wrapper ──────────────────────────────────

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json", ...options?.headers },
    ...options
  });
  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      window.location.href = "/login";
    }
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error?.type, body.error?.message);
  }
  return res.json();
}

// ── Response types ──────────────────────────────────────

type DatasetResponse = { facts_dataset: Dataset };

function unwrapDataset(response: DatasetResponse): Dataset {
  const ds = response.facts_dataset;
  return {
    id: ds.id,
    status: ds.status,
    data: ds.data,
    test_cases: ds.test_cases ?? []
  };
}

// ── Dataset operations ──────────────────────────────────

export async function loadLiveDataset(): Promise<Dataset> {
  const res = await api<DatasetResponse>("/admin/facts_datasets/live");
  return unwrapDataset(res);
}

export async function loadDraftDataset(): Promise<Dataset | null> {
  try {
    const res = await api<DatasetResponse>("/admin/facts_datasets/draft");
    return unwrapDataset(res);
  } catch (err) {
    if (err instanceof ApiError && err.isNotFound) return null;
    throw err;
  }
}

export async function createDraft(): Promise<Dataset> {
  const res = await api<DatasetResponse>("/admin/facts_datasets/draft", { method: "POST" });
  return unwrapDataset(res);
}

export async function saveDraft(blob: DatasetBlob): Promise<Dataset> {
  const res = await api<DatasetResponse>("/admin/facts_datasets/draft", {
    method: "PATCH",
    body: JSON.stringify({ data: blob.data, test_cases: blob.test_cases })
  });
  return unwrapDataset(res);
}

export async function deleteDraft(): Promise<void> {
  await api("/admin/facts_datasets/draft", { method: "DELETE" });
}

export async function publishDraft(): Promise<Dataset> {
  const res = await api<DatasetResponse>("/admin/facts_datasets/draft/publish", { method: "POST" });
  return unwrapDataset(res);
}

// ── Action operations ───────────────────────────────────

type ActionsResponse = { actions: Action[] };

export async function loadActions(): Promise<Action[]> {
  const res = await api<ActionsResponse>("/admin/actions");
  return res.actions;
}
