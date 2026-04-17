import { getApiUrl } from "@/lib/api/config";

export type Downloadable = {
  id: number;
  key: string;
  title: string;
  description: string;
  enabled: boolean;
  airtable_id: string;
  has_file: boolean;
};

class DownloadablesApiError extends Error {
  constructor(
    public status: number,
    message?: string
  ) {
    super(message ?? `API error ${status}`);
    this.name = "DownloadablesApiError";
  }
}

async function parseError(res: Response): Promise<DownloadablesApiError> {
  const body = await res.json().catch(() => ({}));
  return new DownloadablesApiError(res.status, body.error?.message);
}

export async function fetchDownloadables(): Promise<Downloadable[]> {
  const res = await fetch(getApiUrl("/admin/downloadables"), {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    }
  });
  if (!res.ok) throw await parseError(res);
  const body = (await res.json()) as { downloadables: Downloadable[] };
  return body.downloadables;
}

export async function uploadDownloadableFile(key: string, file: File): Promise<Downloadable> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(getApiUrl(`/admin/downloadables/${encodeURIComponent(key)}/upload`), {
    method: "PATCH",
    credentials: "include",
    headers: {
      Accept: "application/json"
    },
    body: form
  });
  if (!res.ok) throw await parseError(res);
  const body = (await res.json()) as { downloadable: Downloadable };
  return body.downloadable;
}

export function downloadableFileUrl(key: string): string {
  return getApiUrl(`/admin/downloadables/${encodeURIComponent(key)}/file`);
}
