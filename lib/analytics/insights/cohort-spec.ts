export type OrgFilters = {
  tier?: ("standard" | "premium")[];
  subscription_status?: string[];
  tags_include?: string[];
  tags_exclude?: string[];
  workshop_uuids?: string[];
  signed_up_from?: string;
  signed_up_to?: string;
  has_tracked_actions?: boolean;
};

export type FactFilter = {
  key: string;
  values: (string | number | boolean)[];
};

export type CohortSpec = {
  org_filters: OrgFilters;
  fact_filters: FactFilter[];
};

export const DEFAULT_COHORT_SPEC: CohortSpec = {
  org_filters: {},
  fact_filters: []
};

/**
 * URL-encodes a CohortSpec for sharing/refresh-survival. Keep it compact
 * by omitting empty filters before encoding.
 */
export function encodeCohortSpec(spec: CohortSpec): string {
  const trimmed: CohortSpec = {
    org_filters: trimOrgFilters(spec.org_filters),
    fact_filters: spec.fact_filters.filter((f) => f.key && f.values.length > 0)
  };
  return btoa(encodeURIComponent(JSON.stringify(trimmed)));
}

export function decodeCohortSpec(encoded: string | null): CohortSpec {
  if (!encoded) return DEFAULT_COHORT_SPEC;
  try {
    const json = decodeURIComponent(atob(encoded));
    const parsed = JSON.parse(json) as Partial<CohortSpec>;
    return {
      org_filters: parsed.org_filters ?? {},
      fact_filters: parsed.fact_filters ?? []
    };
  } catch {
    return DEFAULT_COHORT_SPEC;
  }
}

function trimOrgFilters(filters: OrgFilters): OrgFilters {
  const result: OrgFilters = {};
  if (filters.tier?.length) result.tier = filters.tier;
  if (filters.subscription_status?.length) result.subscription_status = filters.subscription_status;
  if (filters.tags_include?.length) result.tags_include = filters.tags_include;
  if (filters.tags_exclude?.length) result.tags_exclude = filters.tags_exclude;
  if (filters.workshop_uuids?.length) result.workshop_uuids = filters.workshop_uuids;
  if (filters.signed_up_from) result.signed_up_from = filters.signed_up_from;
  if (filters.signed_up_to) result.signed_up_to = filters.signed_up_to;
  if (filters.has_tracked_actions !== undefined) result.has_tracked_actions = filters.has_tracked_actions;
  return result;
}

export function isEmptySpec(spec: CohortSpec): boolean {
  return Object.keys(trimOrgFilters(spec.org_filters)).length === 0 && spec.fact_filters.length === 0;
}
