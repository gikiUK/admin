"use client";

import { useRouter } from "next/navigation";
import { OrgsTable } from "@/components/analytics/orgs-table";
import type { AnalyticsOrganization } from "@/lib/analytics/api";

type Props = {
  members: AnalyticsOrganization[];
};

export function CohortMembersList({ members }: Props) {
  const router = useRouter();

  return (
    <div className="space-y-2">
      <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {members.length === 1 ? "Org" : "Orgs"} in cohort
      </h2>
      <OrgsTable
        organizations={members}
        onSelect={(org) => router.push(`/analytics/orgs/${encodeURIComponent(org.slug)}`)}
      />
    </div>
  );
}
