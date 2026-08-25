import { fetchFeatureFlagCatalogue } from "@/lib/feature-flags/api";
import { buildLoader } from "@/lib/loader";

export const useFeatureFlagCatalogue = buildLoader<string[]>(() =>
  fetchFeatureFlagCatalogue().then((r) => r.feature_flags)
);
