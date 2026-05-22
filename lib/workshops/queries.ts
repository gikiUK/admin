import { fetchCompanies, fetchInvitees, fetchWorkshop, fetchWorkshops } from "@/lib/workshops/api";

export const workshopsKeys = {
  all: ["workshops"] as const,
  list: (page: number) => ["workshops", "list", page] as const,
  detail: (uuid: string) => ["workshops", "detail", uuid] as const,
  invitees: (uuid: string) => ["workshops", "invitees", uuid] as const,
  companies: (uuid: string) => ["workshops", "companies", uuid] as const
};

export function workshopsListQuery(page: number) {
  return { queryKey: workshopsKeys.list(page), queryFn: () => fetchWorkshops(page) };
}

export function workshopDetailQuery(uuid: string) {
  return { queryKey: workshopsKeys.detail(uuid), queryFn: () => fetchWorkshop(uuid) };
}

export function workshopInviteesQuery(uuid: string) {
  return { queryKey: workshopsKeys.invitees(uuid), queryFn: () => fetchInvitees(uuid) };
}

export function workshopCompaniesQuery(uuid: string) {
  return { queryKey: workshopsKeys.companies(uuid), queryFn: () => fetchCompanies(uuid) };
}
