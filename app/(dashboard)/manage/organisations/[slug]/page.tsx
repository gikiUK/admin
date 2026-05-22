"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback } from "react";
import { OrgAccessPanel } from "@/components/manage/org-access-panel";
import { OrgDangerZone } from "@/components/manage/org-danger-zone";
import { OrgMembersPanel } from "@/components/manage/org-members-panel";
import { OrgNamePanel } from "@/components/manage/org-name-panel";
import { OrgOnboardingPanel } from "@/components/manage/org-onboarding-panel";
import { OrgSummaryCard } from "@/components/manage/org-summary-card";
import { OrgTagsPanel } from "@/components/manage/org-tags-panel";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";
import type { ManagedCompany } from "@/lib/manage/api";
import { companyQuery, manageKeys } from "@/lib/manage/queries";

export default function ManageOrganisationPage() {
  const { slug } = useParams<{ slug: string }>();
  const queryClient = useQueryClient();

  const query = useQuery({
    ...companyQuery(slug),
    enabled: Boolean(slug),
    select: (response) => response.company
  });

  const company = query.data;
  const notFound = query.error instanceof ApiError && query.error.isNotFound();
  const errorMessage = query.isError
    ? notFound
      ? "Organisation not found."
      : query.error instanceof Error
        ? query.error.message
        : "Failed to load"
    : "";

  const handleUpdate = useCallback(
    (next: ManagedCompany) => {
      queryClient.setQueryData(manageKeys.company(slug), { company: next });
    },
    [queryClient, slug]
  );

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: manageKeys.company(slug) });
  }, [queryClient, slug]);

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/manage/organisations">
          <ChevronLeft />
          Back to organisations
        </Link>
      </Button>

      {query.isPending && <div className="text-sm text-muted-foreground">Loading organisation…</div>}
      {errorMessage && <div className="text-sm text-destructive">{errorMessage}</div>}

      {company && (
        <>
          <PageHeader title={company.name} description={company.deleted_at ? "Deleted organisation" : undefined} />
          <OrgSummaryCard company={company} />
          <OrgNamePanel company={company} onUpdate={handleUpdate} />
          <OrgTagsPanel company={company} onUpdate={handleUpdate} />
          <OrgAccessPanel company={company} onUpdate={handleUpdate} />
          <OrgMembersPanel slug={company.slug} onMembershipChange={refresh} />
          <OrgOnboardingPanel company={company} onUpdate={handleUpdate} />
          <OrgDangerZone company={company} />
        </>
      )}
    </div>
  );
}
