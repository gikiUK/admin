import { getApiUrl } from "@/lib/api/config";

export type Workshop = {
  uuid: string;
  title: string;
  scheduled_at: string;
  streaming_url: string | null;
  invite_code: string;
  welcome_email_body: string | null;
  followup_email_body: string | null;
  reminder_email_body: string | null;
  started_at: string | null;
  referrer: null | { id: number; name: string };
  invitees_count: number;
  attendees_count: number;
};

export type WorkshopInvitee = {
  uuid: string;
  email: string;
  invite_code: string;
  company_created: boolean;
  welcome_email_sent_at: string | null;
  reminder_email_sent_at: string | null;
};

export type WorkshopCompany = {
  company_slug: string;
  company_name: string;
  user_email: string;
  followup_email_sent_at: string | null;
};

export type WorkshopFormData = {
  title?: string;
  scheduled_at?: string;
  streaming_url?: string;
  welcome_email_body?: string;
  reminder_email_body?: string;
  followup_email_body?: string;
};

class WorkshopsApiError extends Error {
  constructor(
    public status: number,
    message?: string
  ) {
    super(message ?? `API error ${status}`);
    this.name = "WorkshopsApiError";
  }
}

async function parseError(res: Response): Promise<WorkshopsApiError> {
  const body = await res.json().catch(() => ({}));
  return new WorkshopsApiError(res.status, (body as { error?: { message?: string } }).error?.message);
}

const headers = { "Content-Type": "application/json", Accept: "application/json" };
const creds: RequestInit = { credentials: "include", headers };

type PaginatedMeta = { current_page: number; total_count: number; total_pages: number };

export async function fetchWorkshops(page = 1, per = 25): Promise<{ workshops: Workshop[]; meta: PaginatedMeta }> {
  const res = await fetch(getApiUrl(`/admin/webinars?page=${page}&per=${per}`), creds);
  if (!res.ok) throw await parseError(res);
  const body = (await res.json()) as { results: Workshop[]; meta: PaginatedMeta };
  return { workshops: body.results, meta: body.meta };
}

export async function fetchWorkshop(uuid: string): Promise<Workshop> {
  const res = await fetch(getApiUrl(`/admin/webinars/${uuid}`), creds);
  if (!res.ok) throw await parseError(res);
  const body = (await res.json()) as { webinar: Workshop };
  return body.webinar;
}

export async function createWorkshop(data: WorkshopFormData): Promise<Workshop> {
  const res = await fetch(getApiUrl("/admin/webinars"), { ...creds, method: "POST", body: JSON.stringify(data) });
  if (!res.ok) throw await parseError(res);
  const body = (await res.json()) as { webinar: Workshop };
  return body.webinar;
}

export async function updateWorkshop(uuid: string, data: WorkshopFormData): Promise<Workshop> {
  const res = await fetch(getApiUrl(`/admin/webinars/${uuid}`), {
    ...creds,
    method: "PATCH",
    body: JSON.stringify(data)
  });
  if (!res.ok) throw await parseError(res);
  const body = (await res.json()) as { webinar: Workshop };
  return body.webinar;
}

export async function fetchInvitees(uuid: string): Promise<WorkshopInvitee[]> {
  const res = await fetch(getApiUrl(`/admin/webinars/${uuid}/invitees`), creds);
  if (!res.ok) throw await parseError(res);
  const body = (await res.json()) as { invitees: WorkshopInvitee[] };
  return body.invitees;
}

export async function batchAddInvitees(uuid: string, emails: string): Promise<WorkshopInvitee[]> {
  const res = await fetch(getApiUrl(`/admin/webinars/${uuid}/invitees/batch`), {
    ...creds,
    method: "POST",
    body: JSON.stringify({ emails })
  });
  if (!res.ok) throw await parseError(res);
  const body = (await res.json()) as { invitees: WorkshopInvitee[] };
  return body.invitees;
}

export async function removeInvitee(uuid: string, inviteeUuid: string): Promise<void> {
  const res = await fetch(getApiUrl(`/admin/webinars/${uuid}/invitees/${inviteeUuid}`), { ...creds, method: "DELETE" });
  if (!res.ok) throw await parseError(res);
}

export async function fetchCompanies(uuid: string): Promise<WorkshopCompany[]> {
  const res = await fetch(getApiUrl(`/admin/webinars/${uuid}/companies`), creds);
  if (!res.ok) throw await parseError(res);
  const body = (await res.json()) as { companies: WorkshopCompany[] };
  return body.companies;
}

async function postAction(uuid: string, action: string): Promise<void> {
  const res = await fetch(getApiUrl(`/admin/webinars/${uuid}/${action}`), { ...creds, method: "POST" });
  if (!res.ok) throw await parseError(res);
}

export const sendWelcomeEmails = (uuid: string) => postAction(uuid, "send_welcome_emails");
export const sendReminderEmails = (uuid: string) => postAction(uuid, "send_reminder_emails");
export const sendFollowupEmails = (uuid: string) => postAction(uuid, "send_followup_emails");
