import type { AnalyticsEvent } from "@/lib/analytics/api";
import { cn } from "@/lib/utils";

type EventResourceProps = {
  event: AnalyticsEvent;
};

export function EventResource({ event }: EventResourceProps) {
  switch (event.action_type) {
    case "tracked_action_created":
    case "tracked_action_deleted":
    case "tracked_action_status_changed":
    case "tracked_action_assignee_changed":
    case "tracked_action_due_date_changed":
    case "tracked_action_notes_changed":
      return <TrackedActionResource event={event} />;
    case "custom_action_created":
    case "custom_action_updated":
      return <CustomActionResource event={event} />;
    case "custom_action_deleted":
      return <CustomActionDeletedResource event={event} />;
    case "invitation_sent":
    case "invitation_accepted":
    case "invitation_declined":
    case "invitation_revoked":
    case "invitation_role_changed":
      return <InvitationResource event={event} />;
    case "onboarding_question_answered":
      return <OnboardingAnswerResource event={event} />;
    case "membership_role_changed":
      return <MembershipRoleResource event={event} />;
    case "user_deleted":
      return <UserDeletedResource event={event} />;
    default:
      return null;
  }
}

function TrackedActionResource({ event }: EventResourceProps) {
  const { details } = event;
  const actionType = stringValue(details.action_type);
  const actionId = stringValue(details.action_id);
  const status = stringValue(details.status);
  const assignee = stringValue(details.assignee_name);
  const dueDate = stringValue(details.due_date);
  const notes = stringValue(details.notes);

  return (
    <ResourceCard title="Action">
      <DefList>
        {actionType ? <DefItem label="Action type" value={humanize(actionType)} /> : null}
        {actionId ? <DefItem label="Action ID" value={<Mono>{actionId}</Mono>} /> : null}
        {status ? <DefItem label="Status" value={<StatusPill status={status} />} /> : null}
        {assignee ? <DefItem label="Assignee" value={assignee} /> : null}
        {Object.hasOwn(details, "due_date") ? (
          <DefItem label="Due date" value={dueDate ? formatDate(dueDate) : <Muted>cleared</Muted>} />
        ) : null}
        {Object.hasOwn(details, "notes") ? (
          <DefItem
            label="Notes"
            value={
              notes ? <pre className="whitespace-pre-wrap font-sans text-sm">{notes}</pre> : <Muted>cleared</Muted>
            }
          />
        ) : null}
      </DefList>
    </ResourceCard>
  );
}

function CustomActionResource({ event }: EventResourceProps) {
  const { details } = event;
  const id = stringValue(details.id);
  const title = stringValue(details.title);
  const summary = stringValue(details.summary);
  const body = stringValue(details.details);
  const theme = stringValue(details.theme);
  const ghg = arrayValue(details.ghg_categories);
  const subThemes = arrayValue(details.sub_themes);
  const isUpdate = event.action_type === "custom_action_updated";

  return (
    <ResourceCard title={isUpdate ? "Updated fields" : "Custom action"}>
      <DefList>
        {id ? <DefItem label="ID" value={<Mono>{id}</Mono>} /> : null}
        {title ? <DefItem label="Title" value={title} /> : null}
        {summary ? <DefItem label="Summary" value={summary} /> : null}
        {body ? (
          <DefItem label="Details" value={<pre className="whitespace-pre-wrap font-sans text-sm">{body}</pre>} />
        ) : null}
        {theme ? <DefItem label="Theme" value={theme} /> : null}
        {ghg.length ? <DefItem label="GHG categories" value={<TagList values={ghg} />} /> : null}
        {subThemes.length ? <DefItem label="Sub-themes" value={<TagList values={subThemes} />} /> : null}
      </DefList>
    </ResourceCard>
  );
}

function CustomActionDeletedResource({ event }: EventResourceProps) {
  const id = stringValue(event.details.id);
  if (!id) return null;
  return (
    <ResourceCard title="Custom action">
      <DefList>
        <DefItem label="ID" value={<Mono>{id}</Mono>} />
      </DefList>
    </ResourceCard>
  );
}

function InvitationResource({ event }: EventResourceProps) {
  const { details } = event;
  const invitationId = stringValue(details.invitation_id);
  const email = stringValue(details.email);
  const role = stringValue(details.role);
  const newRole = stringValue(details.new_role);

  if (!invitationId && !email && !role && !newRole) return null;

  return (
    <ResourceCard title="Invitation">
      <DefList>
        {email ? <DefItem label="Email" value={email} /> : null}
        {role ? <DefItem label="Role" value={role} /> : null}
        {newRole ? <DefItem label="New role" value={newRole} /> : null}
        {invitationId ? <DefItem label="Invitation ID" value={<Mono>{invitationId}</Mono>} /> : null}
      </DefList>
    </ResourceCard>
  );
}

function OnboardingAnswerResource({ event }: EventResourceProps) {
  const key = stringValue(event.details.key);
  const value = event.details.value;
  if (!key && value === undefined) return null;
  return (
    <ResourceCard title="Answer">
      <DefList>
        {key ? <DefItem label="Question" value={<Mono>{key}</Mono>} /> : null}
        {value !== undefined ? <DefItem label="Answer" value={formatValue(value)} /> : null}
      </DefList>
    </ResourceCard>
  );
}

function MembershipRoleResource({ event }: EventResourceProps) {
  const newRole = stringValue(event.details.new_role);
  if (!newRole) return null;
  return (
    <ResourceCard title="Membership">
      <DefList>
        <DefItem label="New role" value={newRole} />
      </DefList>
    </ResourceCard>
  );
}

function UserDeletedResource({ event }: EventResourceProps) {
  const email = stringValue(event.details.email);
  if (!email) return null;
  return (
    <ResourceCard title="Deleted user">
      <DefList>
        <DefItem label="Email" value={email} />
      </DefList>
    </ResourceCard>
  );
}

function ResourceCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border bg-card p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function DefList({ children }: { children: React.ReactNode }) {
  return <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 text-sm">{children}</dl>;
}

function DefItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground self-start pt-0.5">{label}</dt>
      <dd className="text-foreground">{value}</dd>
    </>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  return <code className="font-mono text-xs">{children}</code>;
}

function Muted({ children }: { children: React.ReactNode }) {
  return <span className="text-muted-foreground italic">{children}</span>;
}

const STATUS_PILL_CLASS: Record<string, string> = {
  not_started: "border-muted-foreground/30 bg-muted text-muted-foreground",
  in_progress: "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  completed: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  archived: "border-muted-foreground/30 bg-muted text-muted-foreground",
  rejected: "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-400"
};

function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
        STATUS_PILL_CLASS[status] ?? STATUS_PILL_CLASS.not_started
      )}
    >
      {humanize(status)}
    </span>
  );
}

function TagList({ values }: { values: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {values.map((value) => (
        <span key={value} className="inline-flex items-center rounded-md border bg-muted px-1.5 py-0.5 text-[11px]">
          {value}
        </span>
      ))}
    </div>
  );
}

function stringValue(value: unknown): string | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  return typeof value === "string" ? value : String(value);
}

function arrayValue(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => (typeof entry === "string" ? entry : String(entry)));
}

function humanize(value: string): string {
  return value.replace(/[_-]+/g, " ").trim();
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function formatValue(value: unknown): React.ReactNode {
  if (value === null || value === undefined) return <Muted>—</Muted>;
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) return <TagList values={value.map(String)} />;
  if (typeof value === "object") {
    return <pre className="whitespace-pre-wrap font-mono text-xs">{JSON.stringify(value, null, 2)}</pre>;
  }
  return String(value);
}
