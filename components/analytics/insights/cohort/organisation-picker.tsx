"use client";

import { useQuery } from "@tanstack/react-query";
import { EntityPicker, type EntityResult } from "@/components/analytics/entity-picker";
import { fetchOrganizations } from "@/lib/analytics/api";
import { organizationQuery } from "@/lib/analytics/queries";

type Props = {
  selectedSlug: string | undefined;
  onChange: (slug: string | undefined) => void;
};

async function searchOrganisations(query: string): Promise<EntityResult[]> {
  const response = await fetchOrganizations({ query, per: 10 });
  return response.results.map((org) => ({ id: org.slug, label: org.name, hint: org.slug }));
}

export function OrganisationPicker({ selectedSlug, onChange }: Props) {
  const { data } = useQuery({ ...organizationQuery(selectedSlug ?? ""), enabled: Boolean(selectedSlug) });
  const selectedLabel = selectedSlug ? (data?.organization.name ?? selectedSlug) : undefined;

  return (
    <div className="space-y-2">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Organisation</span>
      <div className="md:max-w-sm">
        <EntityPicker
          placeholder="Search organisations…"
          selectedLabel={selectedLabel}
          search={searchOrganisations}
          onPick={(entity) => onChange(String(entity.id))}
          onClear={() => onChange(undefined)}
        />
      </div>
    </div>
  );
}
