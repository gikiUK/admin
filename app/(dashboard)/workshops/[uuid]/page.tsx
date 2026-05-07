"use client";

import { Link } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { CompaniesPanel } from "@/components/workshops/companies-panel";
import { EmailSection } from "@/components/workshops/email-section";
import { InviteesPanel } from "@/components/workshops/invitees-panel";
import { WorkshopDetailsForm } from "@/components/workshops/workshop-details-form";
import { getFrontendUrl } from "@/lib/api/config";
import type { Workshop, WorkshopCompany, WorkshopFormData, WorkshopInvitee } from "@/lib/workshops/api";
import {
  fetchCompanies,
  fetchInvitees,
  fetchWorkshop,
  sendFollowupEmails,
  sendReminderEmails,
  sendWelcomeEmails,
  updateWorkshop
} from "@/lib/workshops/api";

export default function WorkshopPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [invitees, setInvitees] = useState<WorkshopInvitee[]>([]);
  const [companies, setCompanies] = useState<WorkshopCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadWorkshop = useCallback(() => fetchWorkshop(uuid).then(setWorkshop), [uuid]);
  const loadInvitees = useCallback(() => fetchInvitees(uuid).then(setInvitees), [uuid]);
  const loadCompanies = useCallback(() => fetchCompanies(uuid).then(setCompanies), [uuid]);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([loadWorkshop(), loadInvitees(), loadCompanies()])
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [loadWorkshop, loadInvitees, loadCompanies]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSaveDetails(data: WorkshopFormData) {
    const updated = await updateWorkshop(uuid, data);
    setWorkshop(updated);
  }

  function makeEmailSaver(field: "welcome_email_body" | "reminder_email_body" | "followup_email_body") {
    return async (body: string) => {
      const updated = await updateWorkshop(uuid, { [field]: body });
      setWorkshop(updated);
    };
  }

  if (loading) return <p className="text-muted-foreground text-sm p-6">Loading…</p>;
  if (error || !workshop) return <p className="text-destructive text-sm p-6">{error || "Not found"}</p>;

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
      <InviteesPanel workshopUuid={uuid} invitees={invitees} onChange={loadInvitees} />
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
