import { apiFetch } from "@/lib/api/client";

export function fetchFeatureFlagCatalogue(): Promise<{ feature_flags: string[] }> {
  return apiFetch<{ feature_flags: string[] }>("/admin/feature_flags");
}
