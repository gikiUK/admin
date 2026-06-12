"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/page-header";
import { CreateReferrerForm } from "@/components/referrers/create-referrer-form";
import { ReferrersTable } from "@/components/referrers/referrers-table";
import { useReferrers } from "@/components/signup-links/form/use-form-data";
import { referrersKeys, referrersQuery } from "@/lib/referrers/queries";

export default function ReferrersPage() {
  const queryClient = useQueryClient();
  const query = useQuery(referrersQuery());

  function handleCreated() {
    useReferrers.invalidate();
    queryClient.invalidateQueries({ queryKey: referrersKeys.list() });
  }

  const errorMessage = query.isError
    ? query.error instanceof Error
      ? query.error.message
      : "Failed to load referrers"
    : "";

  return (
    <div className="space-y-6">
      <PageHeader title="Referrers" description="Sources that signup links can be attributed to." />
      <CreateReferrerForm onCreated={handleCreated} />
      {query.isPending && <div className="text-muted-foreground">Loading…</div>}
      {errorMessage && <div className="text-destructive">{errorMessage}</div>}
      {!query.isPending && !errorMessage && <ReferrersTable referrers={query.data ?? []} />}
    </div>
  );
}
