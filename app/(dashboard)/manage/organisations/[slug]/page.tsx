"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { OrgAccessPanel } from "@/components/manage/org-access-panel";
import { OrgDangerZone } from "@/components/manage/org-danger-zone";
import { OrgMembersPanel } from "@/components/manage/org-members-panel";
import { OrgNamePanel } from "@/components/manage/org-name-panel";
import { OrgOnboardingPanel } from "@/components/manage/org-onboarding-panel";
import { OrgSummaryCard } from "@/components/manage/org-summary-card";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";
import { fetchCompany, type ManagedCompany } from "@/lib/manage/api";

export default function ManageOrganisationPage() {
  const { slug } = useParams<{ slug: string }>();
  const [company, setCompany] = useState<ManagedCompany | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; notFound: boolean } | null>(null);

  const load = useCallback(
    (showLoading = true) => {
      if (!slug) return;
      if (showLoading) setLoading(true);
      setError(null);
      fetchCompany(slug)
        .then((response) => setCompany(response.company))
        .catch((err) => {
          const notFound = err instanceof ApiError && err.isNotFound();
          setError({
            message: notFound ? "Organisation not found." : err instanceof Error ? err.message : "Failed to load",
            notFound
          });
        })
        .finally(() => {
          if (showLoading) setLoading(false);
        });
    },
    [slug]
  );

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(() => load(false), [load]);

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/manage/organisations">
          <ChevronLeft />
          Back to organisations
        </Link>
      </Button>

      {loading && <div className="text-sm text-muted-foreground">Loading organisation…</div>}
      {error && <div className="text-sm text-destructive">{error.message}</div>}

      {company && (
        <>
          <PageHeader title={company.name} description={company.deleted_at ? "Deleted organisation" : undefined} />
          <OrgSummaryCard company={company} />
          <OrgNamePanel company={company} onUpdate={setCompany} />
          <OrgAccessPanel company={company} onUpdate={setCompany} />
          <OrgMembersPanel slug={company.slug} onMembershipChange={refresh} />
          <OrgOnboardingPanel company={company} onUpdate={setCompany} />
          <OrgDangerZone company={company} />
        </>
      )}
    </div>
  );
}
