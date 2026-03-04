"use client";

import { useEffect, useState } from "react";
import { OrganizationsTable } from "@/components/bcorps/organizations-table";
import { PageHeader } from "@/components/page-header";
import { fetchOrganizations } from "@/lib/bcorp/api";
import type { Organization } from "@/lib/bcorp/types";

export default function BCorpsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrganizations()
      .then(setOrganizations)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load organizations"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="BCorps" description="Manage B Corp certification data" />
      {loading && <div className="text-muted-foreground">Loading...</div>}
      {error && <div className="text-destructive">{error}</div>}
      {!loading && !error && <OrganizationsTable organizations={organizations} />}
    </div>
  );
}
