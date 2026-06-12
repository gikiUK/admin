"use client";

import { TagAutocompleteInput } from "@/components/signup-links/form/tag-autocomplete-input";
import { useCompanyTagUniverse } from "@/components/signup-links/form/use-form-data";
import { Label } from "@/components/ui/label";

type Props = {
  analyticsTags: string[];
  onAnalyticsTagsChange: (next: string[]) => void;
};

export function AnalyticsSection({ analyticsTags, onAnalyticsTagsChange }: Props) {
  const tagUniverse = useCompanyTagUniverse();

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
    </section>
  );
}
