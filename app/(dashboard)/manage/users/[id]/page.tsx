"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { UserAccountActionsPanel } from "@/components/manage/user-account-actions-panel";
import { UserDangerZone } from "@/components/manage/user-danger-zone";
import { UserEmailPanel } from "@/components/manage/user-email-panel";
import { UserNamePanel } from "@/components/manage/user-name-panel";
import { UserOrganisationsPanel } from "@/components/manage/user-organisations-panel";
import { UserSummaryCard } from "@/components/manage/user-summary-card";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";
import { fetchUser, type ManagedUser } from "@/lib/manage/api";

export default function ManageUserPage() {
  const { id } = useParams<{ id: string }>();
  const userId = Number(id);
  const [user, setUser] = useState<ManagedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; notFound: boolean } | null>(null);

  const load = useCallback(
    (showLoading = true) => {
      if (!Number.isFinite(userId)) return;
      if (showLoading) setLoading(true);
      setError(null);
      fetchUser(userId)
        .then((response) => setUser(response.user))
        .catch((err) => {
          const notFound = err instanceof ApiError && err.isNotFound();
          setError({
            message: notFound ? "User not found." : err instanceof Error ? err.message : "Failed to load",
            notFound
          });
        })
        .finally(() => {
          if (showLoading) setLoading(false);
        });
    },
    [userId]
  );

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(() => load(false), [load]);

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/manage/users">
          <ChevronLeft />
          Back to users
        </Link>
      </Button>

      {loading && <div className="text-sm text-muted-foreground">Loading user…</div>}
      {error && <div className="text-sm text-destructive">{error.message}</div>}

      {user && (
        <>
          <PageHeader title={user.name || user.email} description={user.name ? user.email : undefined} />
          <UserSummaryCard user={user} />
          <UserNamePanel user={user} onUpdate={setUser} />
          <UserEmailPanel user={user} onUpdate={setUser} />
          <UserAccountActionsPanel user={user} onUpdate={setUser} />
          <UserOrganisationsPanel user={user} onMembershipChange={refresh} />
          <UserDangerZone user={user} />
        </>
      )}
    </div>
  );
}
