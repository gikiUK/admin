import { fetchUsers, type UsersFilter } from "@/lib/analytics/api";
import {
  type CompaniesFilter,
  fetchCompanies,
  fetchCompany,
  fetchMemberships,
  fetchUser,
  type MembershipsFilter
} from "@/lib/manage/api";

export const manageKeys = {
  all: ["manage"] as const,
  companies: (filter: CompaniesFilter) => ["manage", "companies", filter] as const,
  company: (slug: string) => ["manage", "company", slug] as const,
  memberships: (slug: string, filter: MembershipsFilter) => ["manage", "memberships", slug, filter] as const,
  user: (id: number) => ["manage", "user", id] as const,
  // Reuses the analytics fetchUsers but namespaced under "manage" for cache isolation —
  // the analytics page applies different defaults, so we don't want a stray prefetch
  // to leak into the manage member-add dialog.
  userSearch: (query: string) => ["manage", "user-search", query] as const
};

export function companiesQuery(filter: CompaniesFilter) {
  return { queryKey: manageKeys.companies(filter), queryFn: () => fetchCompanies(filter) };
}

export function companyQuery(slug: string) {
  return { queryKey: manageKeys.company(slug), queryFn: () => fetchCompany(slug) };
}

export function membershipsQuery(slug: string, filter: MembershipsFilter = {}) {
  return { queryKey: manageKeys.memberships(slug, filter), queryFn: () => fetchMemberships(slug, filter) };
}

export function userQuery(id: number) {
  return { queryKey: manageKeys.user(id), queryFn: () => fetchUser(id) };
}

export function userSearchQuery(query: string) {
  const filter: UsersFilter = { query, per: 10 };
  return { queryKey: manageKeys.userSearch(query), queryFn: () => fetchUsers(filter) };
}
