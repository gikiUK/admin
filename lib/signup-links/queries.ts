import {
  fetchSignupLink,
  fetchSignupLinkCompanies,
  fetchSignupLinks,
  type SignupLinkCompaniesFilter,
  type SignupLinksFilter
} from "@/lib/signup-links/api";

export const signupLinksKeys = {
  all: ["signup-links"] as const,
  list: (filter: SignupLinksFilter) => ["signup-links", "list", filter] as const,
  detail: (uuid: string) => ["signup-links", "detail", uuid] as const,
  companies: (uuid: string, filter: SignupLinkCompaniesFilter) => ["signup-links", "companies", uuid, filter] as const
};

export function signupLinksListQuery(filter: SignupLinksFilter = {}) {
  return { queryKey: signupLinksKeys.list(filter), queryFn: () => fetchSignupLinks(filter) };
}

export function signupLinkDetailQuery(uuid: string) {
  return { queryKey: signupLinksKeys.detail(uuid), queryFn: () => fetchSignupLink(uuid) };
}

export function signupLinkCompaniesQuery(uuid: string, filter: SignupLinkCompaniesFilter = {}) {
  return {
    queryKey: signupLinksKeys.companies(uuid, filter),
    queryFn: () => fetchSignupLinkCompanies(uuid, filter)
  };
}
