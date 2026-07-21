"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type Props = {
  expiresOn: string;
  maxUses: string;
  skipEmailConfirmation: boolean;
  skipWelcomeEmail: boolean;
  workshopOnboarding: boolean;
  onExpiresOnChange: (next: string) => void;
  onMaxUsesChange: (next: string) => void;
  onSkipEmailConfirmationChange: (next: boolean) => void;
  onSkipWelcomeEmailChange: (next: boolean) => void;
  onWorkshopOnboardingChange: (next: boolean) => void;
};

export function LimitsSection({
  expiresOn,
  maxUses,
  skipEmailConfirmation,
  skipWelcomeEmail,
  workshopOnboarding,
  onExpiresOnChange,
  onMaxUsesChange,
  onSkipEmailConfirmationChange,
  onSkipWelcomeEmailChange,
  onWorkshopOnboardingChange
}: Props) {
  return (
    <section className="space-y-4 rounded-md border p-4">
      <h3 className="text-sm font-semibold">Limits & onboarding</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="expires_on">Expires on</Label>
          <Input id="expires_on" type="date" value={expiresOn} onChange={(e) => onExpiresOnChange(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="max_uses">Max uses</Label>
          <Input
            id="max_uses"
            type="number"
            min={1}
            value={maxUses}
            onChange={(e) => onMaxUsesChange(e.target.value)}
            placeholder="Unlimited"
          />
        </div>
      </div>
      <div className="space-y-2">
        <ToggleRow
          label="Skip email confirmation"
          description="Skip the verification email when signing up via this link."
          checked={skipEmailConfirmation}
          onChange={onSkipEmailConfirmationChange}
        />
        <ToggleRow
          label="Skip welcome email"
          description="Don't send the standard welcome email after signup."
          checked={skipWelcomeEmail}
          onChange={onSkipWelcomeEmailChange}
        />
        <ToggleRow
          label="Workshop onboarding"
          description="Force companies from this link straight into onboarding (e.g. a live workshop) instead of the dashboard."
          checked={workshopOnboarding}
          onChange={onWorkshopOnboardingChange}
        />
      </div>
    </section>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border p-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </div>
  );
}
