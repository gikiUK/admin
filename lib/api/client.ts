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

/**
 * POSTs a JSON body to an endpoint that returns a binary attachment (e.g. text/csv)
 * and triggers a browser download. Uses cookie auth like apiFetch.
 */
export async function apiDownload(path: string, body: unknown, fallbackFilename: string): Promise<void> {
  const res = await fetch(getApiUrl(path), {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/csv, application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errBody = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new ApiError(res.status, errBody.error?.message);
  }

  const blob = await res.blob();
  const filename = filenameFromContentDisposition(res.headers.get("content-disposition")) ?? fallbackFilename;

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function filenameFromContentDisposition(header: string | null): string | null {
  if (!header) return null;
  const match = header.match(/filename="?([^";]+)"?/i);
  return match ? match[1] : null;
}

export type Paginated<T> = {
  results: T[];
  meta: {
    current_page: number;
    total_count: number;
    total_pages: number;
  };
};
