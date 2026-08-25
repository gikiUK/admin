"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { FeatureFlagPicker } from "@/components/manage/feature-flag-picker";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addCompanyFeatureFlag, type ManagedCompany, removeCompanyFeatureFlag } from "@/lib/manage/api";

type OrgFeatureFlagsPanelProps = {
  company: ManagedCompany;
  onUpdate: (company: ManagedCompany) => void;
};

export function OrgFeatureFlagsPanel({ company, onUpdate }: OrgFeatureFlagsPanelProps) {
  const [pending, setPending] = useState<string | null>(null);
  const flags = company.feature_flags ?? [];

  async function toggle(flag: string) {
    const isEnabled = flags.includes(flag);
    setPending(flag);
    try {
      const result = isEnabled
        ? await removeCompanyFeatureFlag(company.slug, flag)
        : await addCompanyFeatureFlag(company.slug, flag);
      onUpdate(result.company);
      toast.success(isEnabled ? "Flag removed" : "Flag added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update flag");
    } finally {
      setPending(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature flags</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FeatureFlagPicker enabled={flags} pending={pending} onToggle={toggle} />

        {flags.length === 0 ? (
          <p className="text-sm text-muted-foreground">No flags enabled.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {flags.map((flag) => (
              <Badge key={flag} variant="secondary" className="gap-1 pr-1 font-mono text-xs">
                {flag}
                <button
                  type="button"
                  onClick={() => toggle(flag)}
                  disabled={pending === flag}
                  aria-label={`Remove ${flag}`}
                  className="rounded-full p-0.5 hover:bg-foreground/10 disabled:opacity-50"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
