import { fetchSyncs } from "@/lib/airtable/api";

export const airtableKeys = {
  all: ["airtable"] as const,
  syncs: () => ["airtable", "syncs"] as const
};

export function syncsQuery() {
  return { queryKey: airtableKeys.syncs(), queryFn: fetchSyncs };
}
