"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { hardDeleteCompany, type ManagedCompany, softDeleteCompany } from "@/lib/manage/api";
import { DeleteOrgDialog } from "./delete-org-dialog";

type OrgDangerZoneProps = {
  company: ManagedCompany;
};

export function OrgDangerZone({ company }: OrgDangerZoneProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function runDelete(action: () => Promise<unknown>, successMessage: string) {
    setDeleting(true);
    try {
      await action();
      toast.success(successMessage);
      router.push("/manage/organisations");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete organisation");
      setDeleting(false);
    }
  }

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle className="text-destructive">Danger zone</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Soft-deletes the organisation. Memberships and invitations are removed, but the record and its data are
            kept.
          </div>
          <DeleteOrgDialog
            triggerLabel="Soft-delete"
            title={`Soft-delete ${company.name}?`}
            description="Removes all memberships and invitations and marks the organisation as deleted. Its data is retained and it can be restored via the API."
            confirmLabel="Soft-delete organisation"
            disabled={deleting}
            onConfirm={() => runDelete(() => softDeleteCompany(company.slug), "Organisation soft-deleted")}
          />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Permanently deletes the organisation and all of its data (answers, tracked actions, custom actions,
            documents, payments). This cannot be undone.
          </div>
          <DeleteOrgDialog
            triggerLabel="Hard-delete"
            title={`Permanently delete ${company.name}?`}
            description="This permanently destroys the organisation and cascades to all of its answers, tracked actions, custom actions, documents, and payments. This action is irreversible."
            confirmLabel="Permanently delete"
            disabled={deleting}
            onConfirm={() => runDelete(() => hardDeleteCompany(company.slug), "Organisation permanently deleted")}
          />
        </div>
      </CardContent>
    </Card>
  );
}
