import { apiFetch, buildQuery, type Paginated } from "@/lib/api/client";

export type OrgTier = "standard" | "premium";

export type OrgAccessStatus = "standard" | "premium" | "premium_trial";

export type ManagedCompany = {
  id: number;
  slug: string;
  name: string;
  logo_url: string | null;
  members_count: number;
  tracked_actions_count: number;
  subscription_tier: OrgTier;
  subscription_status: string;
  trial_ends_at: string | null;
  in_trial: boolean;
  gifted_premium_until: string | null;
  access_status: OrgAccessStatus;
  created_at: string;
  deleted_at: string | null;
};

export type CompaniesFilter = {
  name?: string;
  page?: number;
  per?: number;
};

export function fetchCompanies(filter: CompaniesFilter): Promise<Paginated<ManagedCompany>> {
  return apiFetch<Paginated<ManagedCompany>>(`/admin/companies${buildQuery(filter)}`);
}

export function fetchCompany(slug: string): Promise<{ company: ManagedCompany }> {
  return apiFetch<{ company: ManagedCompany }>(`/admin/companies/${encodeURIComponent(slug)}`);
}

export type UpdateCompanyPayload = {
  trial_ends_at?: string | null;
  gifted_premium_until?: string | null;
  name?: string;
};

export function updateCompany(slug: string, payload: UpdateCompanyPayload): Promise<{ company: ManagedCompany }> {
  return apiFetch<{ company: ManagedCompany }>(`/admin/companies/${encodeURIComponent(slug)}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function resetTrialEndsAt(slug: string): Promise<{ company: ManagedCompany }> {
  return apiFetch<{ company: ManagedCompany }>(`/admin/companies/${encodeURIComponent(slug)}/reset_trial_ends_at`, {
    method: "DELETE"
  });
}

export function ungiftPremium(slug: string): Promise<{ company: ManagedCompany }> {
  return apiFetch<{ company: ManagedCompany }>(`/admin/companies/${encodeURIComponent(slug)}/ungift_premium`, {
    method: "DELETE"
  });
}

export function deleteCompany(slug: string): Promise<Record<string, never>> {
  return apiFetch<Record<string, never>>(`/admin/companies/${encodeURIComponent(slug)}`, {
    method: "DELETE"
  });
}

export function resetOnboarding(slug: string): Promise<{ company: ManagedCompany }> {
  return apiFetch<{ company: ManagedCompany }>(`/admin/companies/${encodeURIComponent(slug)}/reset_onboarding`, {
    method: "DELETE"
  });
}

export const MEMBERSHIP_ROLES = ["owner", "admin", "standard", "readonly"] as const;
export type MembershipRole = (typeof MEMBERSHIP_ROLES)[number];

export type Membership = {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
    avatar_url: string | null;
  };
  role: MembershipRole;
};

export function deleteMembership(slug: string, membershipId: number): Promise<Record<string, never>> {
  return apiFetch<Record<string, never>>(`/admin/companies/${encodeURIComponent(slug)}/memberships/${membershipId}`, {
    method: "DELETE"
  });
}

export function updateMembershipRole(
  slug: string,
  membershipId: number,
  role: MembershipRole
): Promise<{ membership: Membership }> {
  return apiFetch<{ membership: Membership }>(
    `/admin/companies/${encodeURIComponent(slug)}/memberships/${membershipId}/role`,
    {
      method: "PATCH",
      body: JSON.stringify({ role })
    }
  );
}
