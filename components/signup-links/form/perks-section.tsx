"use client";

import { FeatureFlagPicker } from "@/components/signup-links/form/feature-flag-picker";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  premiumUntil: string;
  featureFlags: string[];
  featureFlagsEnabledUntil: string;
  onPremiumUntilChange: (next: string) => void;
  onFeatureFlagsChange: (next: string[]) => void;
  onFeatureFlagsEnabledUntilChange: (next: string) => void;
};

export function PerksSection({
  premiumUntil,
  featureFlags,
  featureFlagsEnabledUntil,
  onPremiumUntilChange,
  onFeatureFlagsChange,
  onFeatureFlagsEnabledUntilChange
}: Props) {
  return (
    <section className="space-y-4 rounded-md border p-4">
      <h3 className="text-sm font-semibold">Perks granted to signups</h3>

      <div className="space-y-1.5">
        <Label>Feature flags</Label>
        <FeatureFlagPicker value={featureFlags} onChange={onFeatureFlagsChange} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="feature_flags_enabled_until">Feature flags enabled until</Label>
        <Input
          id="feature_flags_enabled_until"
          type="date"
          value={featureFlagsEnabledUntil}
          onChange={(e) => onFeatureFlagsEnabledUntilChange(e.target.value)}
          className="w-fit"
        />
        <p className="text-xs text-muted-foreground">
          The flags above switch off after this date. Leave blank to never expire.
        </p>
      </div>

      <div className="space-y-1.5 border-t pt-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="premium_until">Gifted premium until</Label>
          <Badge variant="secondary">Legacy</Badge>
        </div>
        <Input
          id="premium_until"
          type="datetime-local"
          value={premiumUntil}
          onChange={(e) => onPremiumUntilChange(e.target.value)}
          className="w-fit"
        />
        <p className="text-xs text-muted-foreground">
          Grants a gifted premium subscription until this time. Superseded by feature flags — leave blank on new links.
        </p>
      </div>
    </section>
  );
}
