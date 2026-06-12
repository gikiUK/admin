import { fetchReferrers } from "@/lib/signup-links/related-api";

export const referrersKeys = {
  all: ["referrers"] as const,
  list: () => ["referrers", "list"] as const
};

export function referrersQuery() {
  return { queryKey: referrersKeys.list(), queryFn: () => fetchReferrers().then((r) => r.referrers) };
}
