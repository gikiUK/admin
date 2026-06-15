"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { SignupLinkDeleteDialog } from "@/components/signup-links/delete-dialog";
import { SignupLinksTable } from "@/components/signup-links/signup-links-table";
import { Button } from "@/components/ui/button";
import { Pager } from "@/components/ui/pager";
import { signupLinksKeys, signupLinksListQuery } from "@/lib/signup-links/queries";
import type { SignupLink } from "@/lib/signup-links/types";

export default function SignupLinksPage() {
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<SignupLink | null>(null);
  const queryClient = useQueryClient();
  const query = useQuery(signupLinksListQuery({ page }));

  const links = query.data?.results ?? [];
  const meta = query.data?.meta;
  const errorMessage = query.isError
    ? query.error instanceof Error
      ? query.error.message
      : "Failed to load signup links"
    : "";

  function handleDeleted() {
    queryClient.invalidateQueries({ queryKey: signupLinksKeys.all });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Signup Links"
        description="Custom signup URLs that grant perks (premium, feature flags, analytics tags) to companies that sign up through them."
        action={
          <Button asChild>
            <Link href="/signup-links/new">New signup link</Link>
          </Button>
        }
      />
      {query.isPending && <p className="text-muted-foreground text-sm">Loading…</p>}
      {errorMessage && <p className="text-destructive text-sm">{errorMessage}</p>}
      {!query.isPending && !errorMessage && (
        <div className="space-y-4">
          <SignupLinksTable links={links} onDelete={setPendingDelete} />
          {meta && meta.total_pages > 1 && (
            <Pager page={page} totalPages={meta.total_pages} totalCount={meta.total_count} onPageChange={setPage} />
          )}
        </div>
      )}
      <SignupLinkDeleteDialog link={pendingDelete} onClose={() => setPendingDelete(null)} onDeleted={handleDeleted} />
    </div>
  );
}
