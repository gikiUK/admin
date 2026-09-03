"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FeatureFlagPicker } from "@/components/signup-links/form/feature-flag-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addCompanyFeatureFlag, type ManagedCompany, removeCompanyFeatureFlag, updateCompany } from "@/lib/manage/api";

type OrgFeatureFlagsPanelProps = {
  company: ManagedCompany;
  onUpdate: (company: ManagedCompany) => void;
};

/**
 * Setting the expiry needs `feature_flags_enabled_until` on the API's
 * Company::Update, which doesn't accept it yet — it currently only takes name,
 * trial_ends_at and gifted_premium_until. The field below is built and wired,
 * but stays disabled until that lands so it can't silently no-op.
 */
const EXPIRY_EDITABLE = false;

function toDateInputValue(date: string | null | undefined): string {
  return date ? date.slice(0, 10) : "";
}

export function OrgFeatureFlagsPanel({ company, onUpdate }: OrgFeatureFlagsPanelProps) {
  const [draft, setDraft] = useState<string[]>(company.feature_flags);
  const [expiry, setExpiry] = useState(toDateInputValue(company.feature_flags_enabled_until));
  const [saving, setSaving] = useState(false);

  // Re-sync when the company is refetched, so a save elsewhere on the page
  // doesn't leave this panel showing stale flags.
  useEffect(() => {
    setDraft(company.feature_flags);
  }, [company.feature_flags]);

  useEffect(() => {
    setExpiry(toDateInputValue(company.feature_flags_enabled_until));
  }, [company.feature_flags_enabled_until]);

  const added = draft.filter((flag) => !company.feature_flags.includes(flag));
  const removed = company.feature_flags.filter((flag) => !draft.includes(flag));
  const expiryDirty = EXPIRY_EDITABLE && expiry !== toDateInputValue(company.feature_flags_enabled_until);
  const dirty = added.length > 0 || removed.length > 0 || expiryDirty;

  // The API adds and removes one flag at a time, so a batch of edits becomes a
  // sequence of calls. They run in series: each response is the whole company,
  // and concurrent writes would race on the feature_flags array.
  async function handleSave() {
    setSaving(true);
    let latest: ManagedCompany = company;
    try {
      for (const flag of added) {
        latest = (await addCompanyFeatureFlag(company.slug, flag)).company;
      }
      for (const flag of removed) {
        latest = (await removeCompanyFeatureFlag(company.slug, flag)).company;
      }
      if (expiryDirty) {
        latest = (await updateCompany(company.slug, { feature_flags_enabled_until: expiry || null })).company;
      }
      onUpdate(latest);
      toast.success("Feature flags updated");
    } catch (err) {
      // Some calls may already have succeeded, so push whatever the last good
      // response was rather than leaving the page showing pre-save state.
      onUpdate(latest);
      toast.error(err instanceof Error ? err.message : "Failed to update feature flags");
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setDraft(company.feature_flags);
    setExpiry(toDateInputValue(company.feature_flags_enabled_until));
  }

  const premiumFlags = company.premium_feature_flags ?? [];
  const expiryDate = toDateInputValue(company.feature_flags_enabled_until);
  const expired = expiryDate !== "" && expiryDate < today();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature flags</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FeatureFlagPicker value={draft} onChange={setDraft} lockedFlags={premiumFlags} />

        {premiumFlags.length > 0 && (
          <p className="text-xs text-muted-foreground">
            This organisation's subscription switches some flags on by itself. They're ticked and locked here — remove
            the premium access to turn them off.
          </p>
        )}

        <div className="space-y-1.5">
          <Label htmlFor={`flags-until-${company.id}`}>Feature flags enabled until</Label>
          <Input
            id={`flags-until-${company.id}`}
            type="date"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            disabled={saving || !EXPIRY_EDITABLE}
            className="w-fit"
          />
          <p className="text-xs text-muted-foreground">
            {EXPIRY_EDITABLE
              ? "The flags above switch off after this date. Leave blank to never expire."
              : "Read-only: the API can't yet set this on an existing organisation. Set it via a signup link."}
          </p>
          {expired && (
            <p className="text-xs text-destructive">
              These flags expired on {expiryDate} — the organisation only has the flag-gated features its subscription
              grants.
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleSave} disabled={saving || !dirty}>
            {saving ? "Saving…" : "Save"}
          </Button>
          <Button size="sm" variant="outline" onClick={handleReset} disabled={saving || !dirty}>
            Reset
          </Button>
          {dirty && !saving && (
            <span className="text-xs text-muted-foreground">
              {summariseChanges(added.length, removed.length, expiryDirty)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function summariseChanges(added: number, removed: number, expiryChanged: boolean): string {
  const parts: string[] = [];
  if (added > 0) parts.push(`${added} to add`);
  if (removed > 0) parts.push(`${removed} to remove`);
  if (expiryChanged) parts.push("expiry changed");
  return `Unsaved: ${parts.join(", ")}`;
}
