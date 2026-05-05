import { apiFetch, buildQuery, type Paginated } from "@/lib/api/client";

export const ACTION_TYPES = [
  "user_signed_up",
  "user_logged_in",
  "user_deleted",
  "email_confirmed",
  "company_created",
  "company_deleted",
  "onboarding_question_answered",
  "tracked_action_created",
  "tracked_action_deleted",
  "tracked_action_status_changed",
  "tracked_action_assignee_changed",
  "tracked_action_due_date_changed",
  "tracked_action_notes_changed",
  "custom_action_created",
  "custom_action_updated",
  "custom_action_deleted",
  "invitation_sent",
  "invitation_accepted",
  "invitation_declined",
  "invitation_revoked",
  "invitation_role_changed",
  "membership_role_changed",
  "membership_removed"
] as const;

export type ActionType = (typeof ACTION_TYPES)[number];

export type AnalyticsEvent = {
  id: number;
  action_type: string;
  created_at: string;
  details: Record<string, unknown>;
  user: { id: number; name: string } | null;
  company: { id: number; name: string } | null;
};

export type EventsFilter = {
  action_type?: string;
  company_id?: string;
  user_id?: string;
  order?: "newest" | "oldest";
  page?: number;
  per?: number;
};

export type AnalyticsSummary = {
  range: { from: string; to: string };
  active_users: { dau: number; wau: number; mau: number };
  active_orgs: number;
  new_signups: number;
  new_companies: number;
  tracked_actions_added: number;
  tracked_actions_completed: number;
  avg_completion_rate: number;
  status_distribution: Record<string, number>;
  top_completed_action_types: Array<{ action_type: string; count: number }>;
  at_risk_orgs: Array<{
    company_id: number;
    company_name: string;
    last_activity_at: string | null;
    not_started_count: number;
  }>;
  events_over_time?: Array<{ date: string; count: number }>;
  top_action_types?: Array<{ action_type: string; count: number }>;
  tier_breakdown: { standard: number; premium: number };
  subscription_status_breakdown: Record<string, number>;
  trial_orgs: number;
  revenue_in_range: {
    total_amount_in_cents: number;
    payments_count: number;
    by_tier: Array<{ tier: string; amount_in_cents: number; payments_count: number }>;
  };
  onboarding_funnel: {
    total_companies: number;
    questions_completed: number;
    actions_completed: number;
  };
  pre_giki_breakdown: { already_doing: number; previously_done: number; none: number };
  invitations_funnel: {
    sent: number;
    accepted: number;
    declined: number;
    pending: number;
    acceptance_rate: number;
  };
  assignment_breakdown: {
    total: number;
    assigned: number;
    unassigned: number;
    with_due_date: number;
  };
  custom_actions: {
    total: number;
    orgs_with_custom_actions: number;
    avg_per_org: number;
  };
  email_health: { bounced: number; complained: number; opened_recently: number };
};

export function fetchEvents(filter: EventsFilter): Promise<Paginated<AnalyticsEvent>> {
  return apiFetch<Paginated<AnalyticsEvent>>(`/admin/analytics_events${buildQuery(filter)}`);
}

export function fetchSummary(from: string, to: string): Promise<AnalyticsSummary> {
  return apiFetch<AnalyticsSummary>(`/admin/analytics/summary${buildQuery({ from, to })}`);
}

export type AnalyticsUserCompany = {
  id: number;
  name: string;
  role: string;
};

export type AnalyticsUserInviter = {
  id: number;
  name: string;
  company_id: number;
  company_name: string;
};

export const USER_STATUSES = ["active", "dormant", "churned", "unconfirmed", "bounced"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export type AnalyticsUser = {
  id: number;
  email: string;
  name: string;
  signed_up_at: string;
  confirmed_at: string | null;
  last_active_at: string | null;
  first_event_at: string | null;
  event_count: number;
  status: UserStatus;
  companies: AnalyticsUserCompany[];
  invited_by: AnalyticsUserInviter[];
};

export type UsersOrder = "most_active" | "least_active" | "newest_signup" | "oldest_signup";

export type UsersFilter = {
  query?: string;
  company_id?: string;
  status?: UserStatus;
  order?: UsersOrder;
  page?: number;
  per?: number;
};

export function fetchUsers(filter: UsersFilter): Promise<Paginated<AnalyticsUser>> {
  return apiFetch<Paginated<AnalyticsUser>>(`/admin/analytics/users${buildQuery(filter)}`);
}

export const ORG_STATUSES = ["active", "dormant", "churned", "trial", "onboarding"] as const;
export type OrgStatus = (typeof ORG_STATUSES)[number];

export const ORG_TIERS = ["standard", "premium"] as const;
export type OrgTier = (typeof ORG_TIERS)[number];

export type AnalyticsOrganization = {
  id: number;
  name: string;
  slug: string;
  logo_url: string | null;
  subscription_tier: OrgTier;
  subscription_status: string;
  subscription_interval: string | null;
  in_trial: boolean;
  trial_ends_at: string | null;
  signed_up_at: string;
  upgraded_at: string | null;
  last_active_at: string | null;
  first_event_at: string | null;
  event_count: number;
  member_count: number;
  tracked_actions_total: number;
  tracked_actions_completed: number;
  completion_rate: number;
  onboarding_questions_completed: boolean;
  onboarding_actions_completed: boolean;
  status: OrgStatus;
};

export type OrgsOrder = "most_active" | "least_active" | "newest_signup" | "oldest_signup" | "most_members";

export type OrgsFilter = {
  query?: string;
  tier?: OrgTier;
  status?: OrgStatus;
  order?: OrgsOrder;
  page?: number;
  per?: number;
};

export function fetchOrganizations(filter: OrgsFilter): Promise<Paginated<AnalyticsOrganization>> {
  return apiFetch<Paginated<AnalyticsOrganization>>(`/admin/analytics/organizations${buildQuery(filter)}`);
}

export type OrgFact = { key: string; value: unknown };

export type OrgMember = {
  id: number;
  email: string;
  name: string;
  role: string;
  joined_at: string;
  event_count: number;
  last_active_at: string | null;
};

export type OrgTrackedAction = {
  id: number;
  action_type: string;
  action_id: number;
  title: string;
  status: string;
  pre_giki_status: string | null;
  due_date: string | null;
  assignee_name: string | null;
  created_at: string;
  updated_at: string;
};

export type AnalyticsOrganizationDetail = AnalyticsOrganization & {
  facts: OrgFact[];
  members: OrgMember[];
  tracked_actions: OrgTrackedAction[];
};

export function fetchOrganization(slug: string): Promise<{ organization: AnalyticsOrganizationDetail }> {
  return apiFetch<{ organization: AnalyticsOrganizationDetail }>(
    `/admin/analytics/organizations/${encodeURIComponent(slug)}`
  );
}
