import { apiFetch } from "@/lib/api/client";

export type TagWithCount = { name: string; count: number };

export function fetchCompanyTags(): Promise<{ company_tags: TagWithCount[] }> {
  return apiFetch<{ company_tags: TagWithCount[] }>("/admin/analytics/company_tags");
}
