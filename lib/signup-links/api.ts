import { apiFetch, buildQuery, type Paginated } from "@/lib/api/client";
import type { SignupLink, SignupLinkCompany, SignupLinkPayload } from "@/lib/signup-links/types";

export type SignupLinksFilter = {
  page?: number;
  per?: number;
};

export function fetchSignupLinks(filter: SignupLinksFilter = {}): Promise<Paginated<SignupLink>> {
  return apiFetch<Paginated<SignupLink>>(`/admin/signup_links${buildQuery(filter)}`);
}

export function fetchSignupLink(uuid: string): Promise<{ signup_link: SignupLink }> {
  return apiFetch<{ signup_link: SignupLink }>(`/admin/signup_links/${encodeURIComponent(uuid)}`);
}

export function createSignupLink(payload: SignupLinkPayload): Promise<{ signup_link: SignupLink }> {
  return apiFetch<{ signup_link: SignupLink }>("/admin/signup_links", {
    method: "POST",
    body: JSON.stringify({ signup_link: payload })
  });
}

export function updateSignupLink(uuid: string, payload: SignupLinkPayload): Promise<{ signup_link: SignupLink }> {
  return apiFetch<{ signup_link: SignupLink }>(`/admin/signup_links/${encodeURIComponent(uuid)}`, {
    method: "PATCH",
    body: JSON.stringify({ signup_link: payload })
  });
}

export function deleteSignupLink(uuid: string): Promise<Record<string, never>> {
  return apiFetch<Record<string, never>>(`/admin/signup_links/${encodeURIComponent(uuid)}`, {
    method: "DELETE"
  });
}

export type SignupLinkCompaniesFilter = {
  page?: number;
  per?: number;
};

export function fetchSignupLinkCompanies(
  uuid: string,
  filter: SignupLinkCompaniesFilter = {}
): Promise<Paginated<SignupLinkCompany>> {
  return apiFetch<Paginated<SignupLinkCompany>>(
    `/admin/signup_links/${encodeURIComponent(uuid)}/companies${buildQuery(filter)}`
  );
}
