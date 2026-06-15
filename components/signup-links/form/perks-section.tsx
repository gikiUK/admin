"use client";

import { FeatureFlagMultiselect } from "@/components/signup-links/form/feature-flag-multiselect";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  premiumUntil: string;
  featureFlags: string[];
  onPremiumUntilChange: (next: string) => void;
  onFeatureFlagsChange: (next: string[]) => void;
};

export function PerksSection({ premiumUntil, featureFlags, onPremiumUntilChange, onFeatureFlagsChange }: Props) {
  return (
    <section className="space-y-4 rounded-md border p-4">
      <h3 className="text-sm font-semibold">Perks granted to signups</h3>
      <div className="space-y-1.5">
        <Label htmlFor="premium_until">Premium until</Label>
        <Input
          id="premium_until"
          type="datetime-local"
          value={premiumUntil}
          onChange={(e) => onPremiumUntilChange(e.target.value)}
          className="w-fit"
        />
        <p className="text-xs text-muted-foreground">Companies that sign up get premium access until this time.</p>
      </div>
      <div className="space-y-1.5">
        <Label>Feature flags</Label>
        <FeatureFlagMultiselect value={featureFlags} onChange={onFeatureFlagsChange} />
      </div>
    </section>
  );
}
