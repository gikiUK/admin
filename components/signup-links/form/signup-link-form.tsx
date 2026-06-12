"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { SignupLink, SignupLinkPayload } from "@/lib/signup-links/types";
import { AnalyticsSection } from "./analytics-section";
import { BasicFields } from "./basic-fields";
import { LimitsSection } from "./limits-section";
import { PerksSection } from "./perks-section";
import { formStateToPayload, useSignupLinkForm } from "./use-signup-link-form";
import { WelcomePageSection } from "./welcome-page-section";

type Props = {
  initial: SignupLink | null;
  submitLabel: string;
  onSubmit: (payload: SignupLinkPayload) => Promise<void>;
};

export function SignupLinkForm({ initial, submitLabel, onSubmit }: Props) {
  const { state, update } = useSignupLinkForm(initial);
  const [advancedOpen, setAdvancedOpen] = useState(initial !== null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isEdit = initial !== null;
  const codeChanged = isEdit && state.code.trim() !== initial.code;
  const welcomePageIncomplete =
    state.welcome_page_enabled && (!state.welcome_page_title.trim() || !state.welcome_page_body.trim());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const payload = formStateToPayload(state, !isEdit || codeChanged);
      await onSubmit(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <BasicFields
        title={state.title}
        code={state.code}
        enabled={state.enabled}
        originalCode={initial?.code ?? null}
        onTitleChange={(v) => update("title", v)}
        onCodeChange={(v) => update("code", v)}
        onEnabledChange={(v) => update("enabled", v)}
      />

      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger asChild>
          <Button type="button" variant="ghost" size="sm" className="gap-1 px-2">
            <ChevronDown className={`size-3 transition-transform ${advancedOpen ? "rotate-180" : ""}`} />
            Advanced options
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 space-y-4">
          <LimitsSection
            expiresOn={state.expires_on}
            maxUses={state.max_uses}
            skipEmailConfirmation={state.skip_email_confirmation}
            skipWelcomeEmail={state.skip_welcome_email}
            onExpiresOnChange={(v) => update("expires_on", v)}
            onMaxUsesChange={(v) => update("max_uses", v)}
            onSkipEmailConfirmationChange={(v) => update("skip_email_confirmation", v)}
            onSkipWelcomeEmailChange={(v) => update("skip_welcome_email", v)}
          />
          <PerksSection
            premiumUntil={state.premium_until}
            featureFlags={state.feature_flags}
            onPremiumUntilChange={(v) => update("premium_until", v)}
            onFeatureFlagsChange={(v) => update("feature_flags", v)}
          />
          <AnalyticsSection
            analyticsTags={state.analytics_tags}
            analyticsCohorts={state.analytics_cohorts}
            referrerId={state.referrer_id}
            onAnalyticsTagsChange={(v) => update("analytics_tags", v)}
            onAnalyticsCohortsChange={(v) => update("analytics_cohorts", v)}
            onReferrerIdChange={(v) => update("referrer_id", v)}
          />
          <WelcomePageSection
            enabled={state.welcome_page_enabled}
            title={state.welcome_page_title}
            body={state.welcome_page_body}
            onEnabledChange={(v) => update("welcome_page_enabled", v)}
            onTitleChange={(v) => update("welcome_page_title", v)}
            onBodyChange={(v) => update("welcome_page_body", v)}
          />
        </CollapsibleContent>
      </Collapsible>

      {error && <p className="text-destructive text-sm">{error}</p>}
      {welcomePageIncomplete && (
        <p className="text-destructive text-sm">
          Welcome page is enabled but title or body is missing. Fill both fields or turn the welcome page off.
        </p>
      )}
      <Button type="submit" disabled={submitting || !state.title.trim() || welcomePageIncomplete}>
        {submitting ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
