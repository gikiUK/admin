import { apiFetch } from "@/lib/api/client";
import type { SignupLinkReferrer } from "@/lib/signup-links/types";
import type { TagWithCount } from "@/lib/tags/api";

export function fetchReferrers(): Promise<{ referrers: SignupLinkReferrer[] }> {
  return apiFetch<{ referrers: SignupLinkReferrer[] }>("/admin/referrers");
}

export function createReferrer(name: string): Promise<{ referrer: SignupLinkReferrer }> {
  return apiFetch<{ referrer: SignupLinkReferrer }>("/admin/referrers", {
    method: "POST",
    body: JSON.stringify({ name })
  });
}

export function fetchFeatureFlagCatalogue(): Promise<{ feature_flags: string[] }> {
  return apiFetch<{ feature_flags: string[] }>("/admin/feature_flags");
}

export function fetchCompanyCohorts(): Promise<{ cohorts: TagWithCount[] }> {
  return apiFetch<{ cohorts: TagWithCount[] }>("/admin/analytics/cohorts");
}
