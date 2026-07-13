"use client";

import Link from "next/link";
import type { CohortMember } from "@/lib/analytics/insights/insights-api";

type Props = {
  members: CohortMember[];
};

export function CohortMembersList({ members }: Props) {
  if (members.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-md border bg-card px-3 py-2 text-xs">
      <span className="uppercase tracking-wide text-muted-foreground">
        {members.length === 1 ? "Org" : "Orgs"} in cohort
      </span>
      {members.map((member) => (
        <Link
          key={member.org_id}
          href={`/analytics/orgs/${encodeURIComponent(member.slug)}`}
          className="rounded-full border bg-muted/40 px-2 py-0.5 font-medium hover:bg-muted"
        >
          {member.org_name}
        </Link>
      ))}
    </div>
  );
}
