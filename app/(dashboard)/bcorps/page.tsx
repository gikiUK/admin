"use client";

import { useQuery } from "@tanstack/react-query";
import { OrganizationsTable } from "@/components/bcorps/organizations-table";
import { PageHeader } from "@/components/page-header";
import { bcorpOrganizationsQuery } from "@/lib/bcorp/queries";

export default function BCorpsPage() {
  const query = useQuery(bcorpOrganizationsQuery());

  const errorMessage = query.isError
    ? query.error instanceof Error
      ? query.error.message
      : "Failed to load organizations"
    : "";

  return (
    <div className="space-y-6">
      <PageHeader title="BCorps" description="Manage B Corp certification data" />
      {query.isPending && <div className="text-muted-foreground">Loading...</div>}
      {errorMessage && <div className="text-destructive">{errorMessage}</div>}
      {!query.isPending && !errorMessage && <OrganizationsTable organizations={query.data ?? []} />}
    </div>
  );
}
