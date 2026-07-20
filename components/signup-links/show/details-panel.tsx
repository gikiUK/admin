"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SignupLink } from "@/lib/signup-links/types";
import { formatShortDate, formatShortDateTime, formatUses } from "../format";
import { SignupLinkStatusBadge } from "../status-badge";

type Props = {
  link: SignupLink;
};

export function DetailsPanel({ link }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Details</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm md:grid-cols-2">
        <DetailRow label="Status">
          <SignupLinkStatusBadge link={link} />
        </DetailRow>
        <DetailRow label="Uses">{formatUses(link.uses_count, link.max_uses)}</DetailRow>
        <DetailRow label="Expires on">{formatShortDate(link.expires_on)}</DetailRow>
        <DetailRow label="Premium until">{formatShortDateTime(link.premium_until)}</DetailRow>
        <DetailRow label="Skip email confirmation">{link.skip_email_confirmation ? "Yes" : "No"}</DetailRow>
        <DetailRow label="Skip welcome email">{link.skip_welcome_email ? "Yes" : "No"}</DetailRow>
        <DetailRow label="Workshop onboarding">{link.workshop_onboarding ? "Yes" : "No"}</DetailRow>
        <DetailRow label="Welcome page">
          {link.welcome_page_title && link.welcome_page_body ? "Enabled" : "Disabled"}
        </DetailRow>
        <DetailRow label="Feature flags">
          {link.feature_flags.length === 0 ? "—" : link.feature_flags.join(", ")}
        </DetailRow>
        <DetailRow label="Analytics tags">
          {link.analytics_tags.length === 0 ? "—" : link.analytics_tags.join(", ")}
        </DetailRow>
      </CardContent>
    </Card>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span>{children}</span>
    </div>
  );
}
