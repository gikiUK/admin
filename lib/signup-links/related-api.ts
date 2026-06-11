import { apiFetch } from "@/lib/api/client";
import type { SignupLinkReferrer } from "@/lib/signup-links/types";

export type TagWithCount = { name: string; count: number };

export function fetchReferrers(): Promise<{ referrers: SignupLinkReferrer[] }> {
  return apiFetch<{ referrers: SignupLinkReferrer[] }>("/admin/referrers");
}

export function fetchFeatureFlagCatalogue(): Promise<{ feature_flags: string[] }> {
  return apiFetch<{ feature_flags: string[] }>("/admin/feature_flags");
}

export function fetchCompanyTags(): Promise<{ company_tags: TagWithCount[] }> {
  return apiFetch<{ company_tags: TagWithCount[] }>("/admin/analytics/company_tags");
}

export function fetchCompanyCohorts(): Promise<{ cohorts: TagWithCount[] }> {
  return apiFetch<{ cohorts: TagWithCount[] }>("/admin/analytics/cohorts");
}
