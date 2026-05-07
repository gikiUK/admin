import {
  Building2,
  Check,
  CheckCircle2,
  Edit3,
  FileText,
  HelpCircle,
  KeyRound,
  LogIn,
  Mail,
  MailOpen,
  MailX,
  PencilLine,
  Plus,
  RefreshCw,
  Repeat,
  Sparkles,
  Trash2,
  UserCog,
  UserMinus,
  UserPlus,
  UserX
} from "lucide-react";
import type { AnalyticsEvent } from "@/lib/analytics/api";

export type EventTone = "neutral" | "success" | "warning" | "destructive" | "info";

export type EventCategory = "user" | "org" | "action" | "invitation" | "membership" | "onboarding";

export type EventDisplay = {
  label: string;
  icon: typeof Plus;
  tone: EventTone;
  category: EventCategory;
  summarize: (event: AnalyticsEvent) => string;
};

const FALLBACK: EventDisplay = {
  label: "Event",
  icon: Sparkles,
  tone: "neutral",
  category: "user",
  summarize: (event) => humanizeAction(event.action_type)
};

const REGISTRY: Record<string, EventDisplay> = {
  user_signed_up: {
    label: "User signed up",
    icon: UserPlus,
    tone: "success",
    category: "user",
    summarize: (event) => `${nameOrSomeone(event.about_user)} signed up`
  },
  user_logged_in: {
    label: "User logged in",
    icon: LogIn,
    tone: "info",
    category: "user",
    summarize: (event) => `${nameOrSomeone(event.about_user)} logged in`
  },
  user_deleted: {
    label: "User deleted",
    icon: UserX,
    tone: "destructive",
    category: "user",
    summarize: (event) => {
      const email = stringDetail(event, "email");
      const subject = email ?? nameOrSomeone(event.about_user);
      return `${subject} was deleted`;
    }
  },
  user_confirmed: {
    label: "User confirmed",
    icon: CheckCircle2,
    tone: "success",
    category: "user",
    summarize: (event) => `${nameOrSomeone(event.about_user)} confirmed their account`
  },
  email_confirmed: {
    label: "Email confirmed",
    icon: MailOpen,
    tone: "success",
    category: "user",
    summarize: (event) => `${nameOrSomeone(event.about_user)} confirmed their email`
  },
  email_changed: {
    label: "Email changed",
    icon: Mail,
    tone: "info",
    category: "user",
    summarize: (event) => `${nameOrSomeone(event.about_user)} changed their email`
  },
  password_reset_sent: {
    label: "Password reset sent",
    icon: KeyRound,
    tone: "info",
    category: "user",
    summarize: (event) => `Password reset sent to ${nameOrSomeone(event.about_user)}`
  },
  bounced_email_reset: {
    label: "Bounced email reset",
    icon: MailX,
    tone: "warning",
    category: "user",
    summarize: (event) => `Bounced email reset for ${nameOrSomeone(event.about_user)}`
  },
  company_created: {
    label: "Org created",
    icon: Building2,
    tone: "success",
    category: "org",
    summarize: (event) => `${nameOrThe(event.about_company, "an organisation")} was created`
  },
  company_deleted: {
    label: "Org deleted",
    icon: Trash2,
    tone: "destructive",
    category: "org",
    summarize: (event) => `${nameOrThe(event.about_company, "an organisation")} was deleted`
  },
  onboarding_question_answered: {
    label: "Onboarding answer",
    icon: HelpCircle,
    tone: "info",
    category: "onboarding",
    summarize: (event) => {
      const key = stringDetail(event, "key");
      const company = nameOrThe(event.about_company, "an org");
      return key ? `${company} answered "${key}"` : `${company} answered an onboarding question`;
    }
  },
  onboarding_reset: {
    label: "Onboarding reset",
    icon: RefreshCw,
    tone: "warning",
    category: "onboarding",
    summarize: (event) => `${nameOrThe(event.about_company, "an org")} reset onboarding`
  },
  tracked_action_created: {
    label: "Action added",
    icon: Plus,
    tone: "success",
    category: "action",
    summarize: (event) => actionSentence(event, "added")
  },
  tracked_action_deleted: {
    label: "Action removed",
    icon: Trash2,
    tone: "destructive",
    category: "action",
    summarize: (event) => actionSentence(event, "removed")
  },
  tracked_action_status_changed: {
    label: "Action status changed",
    icon: Check,
    tone: "info",
    category: "action",
    summarize: (event) => {
      const status = stringDetail(event, "status");
      const verb = status === "completed" ? "completed" : `set status to ${humanize(status ?? "")}`;
      return `${nameOrSomeone(event.acting_user)} ${verb} an action at ${nameOrThe(event.about_company, "an org")}`;
    }
  },
  tracked_action_assignee_changed: {
    label: "Assignee changed",
    icon: UserCog,
    tone: "warning",
    category: "action",
    summarize: (event) => {
      const assignee = stringDetail(event, "assignee_name");
      const tail = assignee ? `to ${assignee}` : "";
      return `${nameOrSomeone(event.acting_user)} reassigned an action ${tail}`.trim();
    }
  },
  tracked_action_due_date_changed: {
    label: "Due date changed",
    icon: PencilLine,
    tone: "warning",
    category: "action",
    summarize: (event) => {
      const due = stringDetail(event, "due_date");
      const tail = due ? `to ${formatDate(due)}` : "(cleared)";
      return `${nameOrSomeone(event.acting_user)} changed an action's due date ${tail}`;
    }
  },
  tracked_action_notes_changed: {
    label: "Notes changed",
    icon: FileText,
    tone: "warning",
    category: "action",
    summarize: (event) => `${nameOrSomeone(event.acting_user)} updated notes on an action`
  },
  custom_action_created: {
    label: "Custom action created",
    icon: Sparkles,
    tone: "success",
    category: "action",
    summarize: (event) => {
      const title = stringDetail(event, "title");
      const tail = title ? `"${title}"` : "a custom action";
      return `${nameOrThe(event.about_company, "an org")} created ${tail}`;
    }
  },
  custom_action_updated: {
    label: "Custom action updated",
    icon: Edit3,
    tone: "info",
    category: "action",
    summarize: (event) => {
      const fields = changedFields(event);
      const tail = fields.length ? ` (${fields.join(", ")})` : "";
      return `${nameOrThe(event.about_company, "an org")} updated a custom action${tail}`;
    }
  },
  custom_action_deleted: {
    label: "Custom action deleted",
    icon: Trash2,
    tone: "destructive",
    category: "action",
    summarize: (event) => `${nameOrThe(event.about_company, "an org")} deleted a custom action`
  },
  invitation_sent: {
    label: "Invitation sent",
    icon: Mail,
    tone: "info",
    category: "invitation",
    summarize: (event) => {
      const email = stringDetail(event, "email");
      const role = stringDetail(event, "role");
      const tail = role ? ` as ${role}` : "";
      return email
        ? `${nameOrThe(event.about_company, "An org")} invited ${email}${tail}`
        : `${nameOrThe(event.about_company, "An org")} sent an invitation${tail}`;
    }
  },
  invitation_accepted: {
    label: "Invitation accepted",
    icon: UserPlus,
    tone: "success",
    category: "invitation",
    summarize: (event) =>
      `${nameOrSomeone(event.about_user)} accepted an invitation to ${nameOrThe(event.about_company, "an org")}`
  },
  invitation_declined: {
    label: "Invitation declined",
    icon: UserX,
    tone: "destructive",
    category: "invitation",
    summarize: (event) => `An invitation to ${nameOrThe(event.about_company, "an org")} was declined`
  },
  invitation_revoked: {
    label: "Invitation revoked",
    icon: MailX,
    tone: "warning",
    category: "invitation",
    summarize: (event) => {
      const email = stringDetail(event, "email");
      return email
        ? `${nameOrThe(event.about_company, "An org")} revoked the invite to ${email}`
        : `${nameOrThe(event.about_company, "An org")} revoked an invitation`;
    }
  },
  invitation_role_changed: {
    label: "Invitation role changed",
    icon: Repeat,
    tone: "warning",
    category: "invitation",
    summarize: (event) => {
      const role = stringDetail(event, "new_role");
      const tail = role ? ` to ${role}` : "";
      return `${nameOrThe(event.about_company, "An org")} changed an invitation's role${tail}`;
    }
  },
  membership_created: {
    label: "Membership added",
    icon: UserPlus,
    tone: "success",
    category: "membership",
    summarize: (event) => `${nameOrSomeone(event.about_user)} joined ${nameOrThe(event.about_company, "an org")}`
  },
  membership_role_changed: {
    label: "Role changed",
    icon: UserCog,
    tone: "warning",
    category: "membership",
    summarize: (event) => {
      const role = stringDetail(event, "new_role");
      const tail = role ? ` to ${role}` : "";
      return `${nameOrSomeone(event.about_user)}'s role at ${nameOrThe(event.about_company, "an org")} changed${tail}`;
    }
  },
  membership_removed: {
    label: "Membership removed",
    icon: UserMinus,
    tone: "destructive",
    category: "membership",
    summarize: (event) =>
      `${nameOrSomeone(event.about_user)} was removed from ${nameOrThe(event.about_company, "an org")}`
  }
};

export function getEventDisplay(actionType: string): EventDisplay {
  return REGISTRY[actionType] ?? { ...FALLBACK, label: humanizeAction(actionType) };
}

export function summarizeEvent(event: AnalyticsEvent): string {
  return getEventDisplay(event.action_type).summarize(event);
}

export const TONE_BADGE_CLASS: Record<EventTone, string> = {
  neutral: "border-muted-foreground/30 bg-muted text-muted-foreground",
  success: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  warning: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  destructive: "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-400",
  info: "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-400"
};

export const TONE_ICON_CLASS: Record<EventTone, string> = {
  neutral: "text-muted-foreground",
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  destructive: "text-rose-600 dark:text-rose-400",
  info: "text-sky-600 dark:text-sky-400"
};

const RESOURCE_KEYS = new Set([
  "id",
  "action_id",
  "action_type",
  "title",
  "summary",
  "details",
  "theme",
  "ghg_categories",
  "sub_themes"
]);

function changedFields(event: AnalyticsEvent): string[] {
  return Object.keys(event.details ?? {})
    .filter((key) => RESOURCE_KEYS.has(key) && key !== "id" && key !== "action_id" && key !== "action_type")
    .map((key) => humanize(key));
}

function stringDetail(event: AnalyticsEvent, key: string): string | undefined {
  const value = (event.details as Record<string, unknown> | null)?.[key];
  if (value === null || value === undefined || value === "") return undefined;
  return typeof value === "string" ? value : String(value);
}

function nameOrSomeone(person: { name: string } | null): string {
  return person?.name ?? "Someone";
}

function nameOrThe(company: { name: string } | null, fallback: string): string {
  return company?.name ?? fallback;
}

function actionSentence(event: AnalyticsEvent, verb: string): string {
  const actor = nameOrSomeone(event.acting_user);
  const company = nameOrThe(event.about_company, "an org");
  const actionType = stringDetail(event, "action_type");
  const noun = actionType ? humanize(actionType) : "an action";
  return `${actor} ${verb} ${article(noun)} at ${company}`;
}

function humanize(value: string): string {
  return value.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
}

function humanizeAction(value: string): string {
  const lower = humanize(value);
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function article(noun: string): string {
  return /^[aeiou]/i.test(noun) ? `an ${noun}` : `a ${noun}`;
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export function formatRelative(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  const diffMs = now.getTime() - then.getTime();
  if (Number.isNaN(diffMs)) return iso;
  const seconds = Math.round(diffMs / 1000);
  if (seconds < 45) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.round(days / 365);
  return `${years}y ago`;
}
