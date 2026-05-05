import { getApiUrl } from "@/lib/api/config";

export class ApiError extends Error {
  constructor(
    public status: number,
    message?: string
  ) {
    super(message ?? `API error ${status}`);
    this.name = "ApiError";
  }

  isNotFound() {
    return this.status === 404;
  }
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
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
    const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new ApiError(res.status, body.error?.message);
  }
  return res.json() as Promise<T>;
}

export function buildQuery(params: Record<string, string | number | undefined | null>): string {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    usp.set(key, String(value));
  }
  const query = usp.toString();
  return query ? `?${query}` : "";
}

export type Paginated<T> = {
  results: T[];
  meta: {
    current_page: number;
    total_count: number;
    total_pages: number;
  };
};
