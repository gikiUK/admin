"use client";

import { useQuery } from "@tanstack/react-query";
import { CadenceGroupCard } from "@/components/cadence-emails/cadence-group-card";
import { PageHeader } from "@/components/page-header";
import { cadencesListQuery } from "@/lib/cadence-emails/queries";

export default function CadenceEmailsPage() {
  const query = useQuery(cadencesListQuery());

  const cadences = query.data?.cadences ?? [];
  const errorMessage = query.isError
    ? query.error instanceof Error
      ? query.error.message
      : "Failed to load cadence emails"
    : "";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cadence Emails"
        description="Onboarding email sequences. A company is in at most one cadence at a time, moving forwards as it progresses, and never goes backwards."
      />
      {query.isPending && <p className="text-muted-foreground text-sm">Loading…</p>}
      {errorMessage && <p className="text-destructive text-sm">{errorMessage}</p>}
      {!query.isPending && !errorMessage && (
        <div className="space-y-6">
          {cadences.map((cadence) => (
            <CadenceGroupCard key={cadence.key} cadence={cadence} />
          ))}
        </div>
      )}
    </div>
  );
}
