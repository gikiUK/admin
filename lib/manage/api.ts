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

export type MembershipsFilter = {
  page?: number;
  per?: number;
};

export function fetchMemberships(slug: string, filter: MembershipsFilter = {}): Promise<Paginated<Membership>> {
  return apiFetch<Paginated<Membership>>(
    `/admin/companies/${encodeURIComponent(slug)}/memberships${buildQuery(filter)}`
  );
}

export type CreateMembershipPayload = {
  user_id: number;
  role: MembershipRole;
};

export function createMembership(slug: string, payload: CreateMembershipPayload): Promise<{ membership: Membership }> {
  return apiFetch<{ membership: Membership }>(`/admin/companies/${encodeURIComponent(slug)}/memberships`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

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

export type ManagedUserCompany = {
  id: number;
  slug: string;
  name: string;
  role: MembershipRole;
  membership_id: number;
};

export type ManagedUser = {
  id: number;
  email: string;
  name: string;
  signed_up_at: string;
  confirmed_at: string | null;
  last_active_at: string | null;
  email_bounced_at: string | null;
  companies: ManagedUserCompany[];
};

export function fetchUser(id: number): Promise<{ user: ManagedUser }> {
  return apiFetch<{ user: ManagedUser }>(`/admin/users/${id}`);
}

export type UpdateUserPayload = {
  name?: string;
  email?: string;
};

export function updateUser(id: number, payload: UpdateUserPayload): Promise<{ user: ManagedUser }> {
  return apiFetch<{ user: ManagedUser }>(`/admin/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function deleteUser(id: number): Promise<Record<string, never>> {
  return apiFetch<Record<string, never>>(`/admin/users/${id}`, {
    method: "DELETE"
  });
}

export function confirmUser(id: number): Promise<{ user: ManagedUser }> {
  return apiFetch<{ user: ManagedUser }>(`/admin/users/${id}/confirm`, {
    method: "POST"
  });
}

export function sendPasswordReset(id: number): Promise<Record<string, never>> {
  return apiFetch<Record<string, never>>(`/admin/users/${id}/send_password_reset`, {
    method: "POST"
  });
}

export function clearEmailBounce(id: number): Promise<{ user: ManagedUser }> {
  return apiFetch<{ user: ManagedUser }>(`/admin/users/${id}/reset_bounced_email`, {
    method: "POST"
  });
}
