"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { CadenceEmailForm } from "@/components/cadence-emails/form/cadence-email-form";
import { ReadOnlyMeta } from "@/components/cadence-emails/form/read-only-meta";
import { SendTestButton } from "@/components/cadence-emails/form/send-test-button";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { updateCadenceEmail } from "@/lib/cadence-emails/api";
import { cadenceLabel } from "@/lib/cadence-emails/labels";
import { cadenceEmailDetailQuery, cadenceEmailsKeys } from "@/lib/cadence-emails/queries";
import type { CadenceEmailPayload } from "@/lib/cadence-emails/types";

export default function EditCadenceEmailPage() {
  const { key } = useParams<{ key: string }>();
  const queryClient = useQueryClient();
  const query = useQuery(cadenceEmailDetailQuery(key));

  const email = query.data?.cadence_email;

  async function handleSubmit(payload: CadenceEmailPayload) {
    if (Object.keys(payload).length === 0) return;
    const res = await updateCadenceEmail(key, payload);
    queryClient.setQueryData(cadenceEmailsKeys.detail(key), res);
    queryClient.invalidateQueries({ queryKey: cadenceEmailsKeys.list() });
    toast.success("Saved.");
  }

  if (query.isPending) return <p className="text-muted-foreground text-sm">Loading…</p>;
  if (query.isError || !email) {
    return (
      <p className="text-destructive text-sm">
        {query.error instanceof Error ? query.error.message : "Cadence email not found"}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/manage/cadence-emails">
          <ArrowLeft className="size-3.5" />
          All cadence emails
        </Link>
      </Button>

      <PageHeader
        title={email.subject || email.key}
        description={`${cadenceLabel(email.cadence_key)} · email ${email.position} in the sequence`}
        action={<SendTestButton emailKey={email.key} />}
      />

      <ReadOnlyMeta email={email} />

      {/* Remount on key change so the form state reloads when navigating between emails. */}
      <CadenceEmailForm key={email.key} email={email} onSubmit={handleSubmit} />
    </div>
  );
}
