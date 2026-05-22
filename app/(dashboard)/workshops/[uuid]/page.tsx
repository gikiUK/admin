"use client";

import { useQueries, useQueryClient } from "@tanstack/react-query";
import { Link } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { CompaniesPanel } from "@/components/workshops/companies-panel";
import { EmailSection } from "@/components/workshops/email-section";
import { InviteesPanel } from "@/components/workshops/invitees-panel";
import { WorkshopDetailsForm } from "@/components/workshops/workshop-details-form";
import { getFrontendUrl } from "@/lib/api/config";
import type { Workshop, WorkshopFormData } from "@/lib/workshops/api";
import { sendFollowupEmails, sendReminderEmails, sendWelcomeEmails, updateWorkshop } from "@/lib/workshops/api";
import {
  workshopCompaniesQuery,
  workshopDetailQuery,
  workshopInviteesQuery,
  workshopsKeys
} from "@/lib/workshops/queries";

export default function WorkshopPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const queryClient = useQueryClient();

  const [workshopQuery, inviteesQuery, companiesQuery] = useQueries({
    queries: [workshopDetailQuery(uuid), workshopInviteesQuery(uuid), workshopCompaniesQuery(uuid)]
  });

  const workshop = workshopQuery.data;
  const invitees = inviteesQuery.data ?? [];
  const companies = companiesQuery.data ?? [];

  const loading = workshopQuery.isPending || inviteesQuery.isPending || companiesQuery.isPending;
  const errorMessage = (() => {
    const err = workshopQuery.error ?? inviteesQuery.error ?? companiesQuery.error;
    if (!err) return "";
    return err instanceof Error ? err.message : "Failed to load workshop";
  })();

  const refreshInvitees = useCallback(
    () => queryClient.invalidateQueries({ queryKey: workshopsKeys.invitees(uuid) }),
    [queryClient, uuid]
  );

  async function handleSaveDetails(data: WorkshopFormData) {
    const updated = await updateWorkshop(uuid, data);
    queryClient.setQueryData<Workshop>(workshopsKeys.detail(uuid), updated);
  }

  function makeEmailSaver(field: "welcome_email_body" | "reminder_email_body" | "followup_email_body") {
    return async (body: string) => {
      const updated = await updateWorkshop(uuid, { [field]: body });
      queryClient.setQueryData<Workshop>(workshopsKeys.detail(uuid), updated);
    };
  }

  if (loading) return <p className="text-muted-foreground text-sm p-6">Loading…</p>;
  if (errorMessage || !workshop) return <p className="text-destructive text-sm p-6">{errorMessage || "Not found"}</p>;

  const inviteUrl = getFrontendUrl(`/auth/workshop/${workshop.invite_code}`);

  function copyInviteUrl() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(inviteUrl);
    } else {
      const el = document.createElement("textarea");
      el.value = inviteUrl;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    toast.success("Invite URL copied to clipboard.");
  }

  return (
    <div className="space-y-8">
      <PageHeader title={workshop.title} description={`Invite code: ${workshop.invite_code}`} />
      <button
        type="button"
        onClick={copyInviteUrl}
        className="inline-flex items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2 transition-colors hover:bg-muted"
      >
        <span className="font-mono text-xs text-muted-foreground">{inviteUrl}</span>
        <span className="flex shrink-0 items-center gap-1 text-xs font-medium">
          <Link className="size-3" />
          Copy
        </span>
      </button>
      <WorkshopDetailsForm initial={workshop} onSave={handleSaveDetails} />
      <InviteesPanel workshopUuid={uuid} invitees={invitees} onChange={refreshInvitees} />
      <CompaniesPanel companies={companies} />
      <EmailSection
        title="Welcome Email"
        description="Sent to invitees when they are first invited."
        initialBody={workshop.welcome_email_body ?? ""}
        sendLabel="Send Welcome Emails"
        onSave={makeEmailSaver("welcome_email_body")}
        onSend={() => sendWelcomeEmails(uuid)}
      />
      <EmailSection
        title="Reminder Email"
        description="Sent to invitees before the workshop starts."
        initialBody={workshop.reminder_email_body ?? ""}
        sendLabel="Send Reminder Emails"
        onSave={makeEmailSaver("reminder_email_body")}
        onSend={() => sendReminderEmails(uuid)}
      />
      <EmailSection
        title="Followup Email"
        description="Sent to attendees after the workshop ends."
        initialBody={workshop.followup_email_body ?? ""}
        sendLabel="Send Followup Emails"
        onSave={makeEmailSaver("followup_email_body")}
        onSend={() => sendFollowupEmails(uuid)}
      />
    </div>
  );
}
