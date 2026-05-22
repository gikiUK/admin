"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { UserAccountActionsPanel } from "@/components/manage/user-account-actions-panel";
import { UserDangerZone } from "@/components/manage/user-danger-zone";
import { UserEmailPanel } from "@/components/manage/user-email-panel";
import { UserNamePanel } from "@/components/manage/user-name-panel";
import { UserOrganisationsPanel } from "@/components/manage/user-organisations-panel";
import { UserSummaryCard } from "@/components/manage/user-summary-card";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";
import type { ManagedUser } from "@/lib/manage/api";
import { manageKeys, userQuery } from "@/lib/manage/queries";

export default function ManageUserPage() {
  const { id } = useParams<{ id: string }>();
  const userId = Number(id);
  const validId = Number.isFinite(userId);
  const queryClient = useQueryClient();

  const query = useQuery({
    ...userQuery(userId),
    enabled: validId,
    select: (response) => response.user
  });

  const user = query.data;
  const notFound = query.error instanceof ApiError && query.error.isNotFound();
  const errorMessage = !validId
    ? "Invalid user ID."
    : query.isError
      ? notFound
        ? "User not found."
        : query.error instanceof Error
          ? query.error.message
          : "Failed to load"
      : "";

  function handleUpdate(next: ManagedUser) {
    queryClient.setQueryData(manageKeys.user(userId), { user: next });
  }

  function refresh() {
    queryClient.invalidateQueries({ queryKey: manageKeys.user(userId) });
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/manage/users">
          <ChevronLeft />
          Back to users
        </Link>
      </Button>

      {validId && query.isPending && <div className="text-sm text-muted-foreground">Loading user…</div>}
      {errorMessage && <div className="text-sm text-destructive">{errorMessage}</div>}

      {user && (
        <>
          <PageHeader title={user.name || user.email} description={user.name ? user.email : undefined} />
          <UserSummaryCard user={user} />
          <UserNamePanel user={user} onUpdate={handleUpdate} />
          <UserEmailPanel user={user} onUpdate={handleUpdate} />
          <UserAccountActionsPanel user={user} onUpdate={handleUpdate} />
          <UserOrganisationsPanel user={user} onMembershipChange={refresh} />
          <UserDangerZone user={user} />
        </>
      )}
    </div>
  );
}
