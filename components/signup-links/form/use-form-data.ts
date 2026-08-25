import { buildLoader } from "@/lib/loader";
import { fetchCompanyTags, type TagWithCount } from "@/lib/tags/api";

export { useFeatureFlagCatalogue } from "@/lib/feature-flags/use-catalogue";

export const useCompanyTagUniverse = buildLoader<TagWithCount[]>(() => fetchCompanyTags().then((r) => r.company_tags));
