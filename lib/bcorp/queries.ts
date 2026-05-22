import { fetchOrganizations, fetchPlan } from "@/lib/bcorp/api";

export const bcorpKeys = {
  all: ["bcorp"] as const,
  organizations: () => ["bcorp", "organizations"] as const,
  plan: (orgId: string) => ["bcorp", "plan", orgId] as const,
  data: (orgId: string) => ["bcorp", "data", orgId] as const
};

export function bcorpOrganizationsQuery() {
  return { queryKey: bcorpKeys.organizations(), queryFn: fetchOrganizations };
}

export function bcorpPlanQuery(orgId: string) {
  return { queryKey: bcorpKeys.plan(orgId), queryFn: () => fetchPlan(orgId) };
}
