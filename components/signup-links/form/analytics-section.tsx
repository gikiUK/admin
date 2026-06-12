"use client";

import Link from "next/link";
import { ReferrerSelect } from "@/components/signup-links/form/referrer-select";
import { TagAutocompleteInput } from "@/components/signup-links/form/tag-autocomplete-input";
import { useCompanyCohortUniverse, useCompanyTagUniverse } from "@/components/signup-links/form/use-form-data";
import { Label } from "@/components/ui/label";

type Props = {
  analyticsTags: string[];
  analyticsCohorts: string[];
  referrerId: string;
  onAnalyticsTagsChange: (next: string[]) => void;
  onAnalyticsCohortsChange: (next: string[]) => void;
  onReferrerIdChange: (next: string) => void;
};

export function AnalyticsSection({
  analyticsTags,
  analyticsCohorts,
  referrerId,
  onAnalyticsTagsChange,
  onAnalyticsCohortsChange,
  onReferrerIdChange
}: Props) {
  const tagUniverse = useCompanyTagUniverse();
  const cohortUniverse = useCompanyCohortUniverse();

  return (
    <section className="space-y-4 rounded-md border p-4">
      <h3 className="text-sm font-semibold">Attribution</h3>
      <div className="space-y-1.5">
        <Label>Analytics tags</Label>
        <TagAutocompleteInput
          value={analyticsTags}
          onChange={onAnalyticsTagsChange}
          universe={tagUniverse}
          placeholder="Add tag"
        />
        <p className="text-xs text-muted-foreground">Applied to every company signing up via this link.</p>
      </div>
      <div className="space-y-1.5">
        <Label>Analytics cohorts</Label>
        <TagAutocompleteInput
          value={analyticsCohorts}
          onChange={onAnalyticsCohortsChange}
          universe={cohortUniverse}
          placeholder="Add cohort"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="referrer_id">Referrer</Label>
        <ReferrerSelect value={referrerId} onChange={onReferrerIdChange} />
        <Link
          href="/referrers"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-xs text-primary hover:underline"
        >
          Add referrer
        </Link>
      </div>
    </section>
  );
}
