export type SignupLink = {
  uuid: string;
  code: string;
  title: string;
  enabled: boolean;
  expires_on: string | null;
  max_uses: number | null;
  uses_count: number;
  consumed_count: number;
  premium_until: string | null;
  feature_flags: string[];
  analytics_tags: string[];
  skip_email_confirmation: boolean;
  skip_welcome_email: boolean;
  workshop_onboarding: boolean;
  welcome_page_title: string | null;
  welcome_page_body: string | null;
  expired: boolean;
  exhausted: boolean;
  usable: boolean;
  created_at?: string;
};

export type SignupLinkPayload = {
  title?: string;
  code?: string;
  enabled?: boolean;
  expires_on?: string | null;
  max_uses?: number | null;
  premium_until?: string | null;
  skip_email_confirmation?: boolean;
  skip_welcome_email?: boolean;
  workshop_onboarding?: boolean;
  welcome_page_title?: string | null;
  welcome_page_body?: string | null;
  feature_flags?: string[];
  analytics_tags?: string[];
};

export type SignupLinkCompany = {
  id: number;
  slug: string;
  name: string;
  logo_url: string | null;
  members_count: number;
  tracked_actions_count: number;
  subscription_tier: "standard" | "premium";
  subscription_status: string;
  trial_ends_at: string | null;
  in_trial: boolean;
  gifted_premium_until: string | null;
  access_status: "standard" | "premium" | "premium_trial";
  analytics_tags: string[];
  feature_flags: string[];
  created_at: string;
  deleted_at: string | null;
};

export type SignupLinkStatus = "disabled" | "expired" | "exhausted" | "active";

export function signupLinkStatus(link: SignupLink): SignupLinkStatus {
  if (!link.enabled) return "disabled";
  if (link.expired) return "expired";
  if (link.exhausted) return "exhausted";
  return "active";
}
