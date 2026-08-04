import type { CadenceRule, MinimumRoleRule, RoleKey } from "@/lib/cadence-emails/types";
import { isMinimumRoleRule } from "@/lib/cadence-emails/types";

/** "premium_only" → "Premium only". The fallback for any key we don't know. */
export function humanize(key: string): string {
  const words = key.replace(/_/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Rule keys humanize() gets wrong. Anything absent falls back to humanize(). */
const RULE_LABELS: Record<string, string> = {
  non_premium_only: "Non-premium only"
};

/**
 * Roles read as plurals mid-sentence, which humanize() can't produce. Unknown
 * roles fall back to a lowercased key so a new one is legible, not blank.
 */
const ROLE_LABELS: Record<string, string> = {
  owner: "owners",
  admin: "admins",
  standard: "standard members",
  readonly: "read-only members"
};

/** Mirrors CompanyMembership::ROLES, most senior first — only used to spot the top role. */
const MOST_SENIOR_ROLE = "owner";

export function roleLabel(role: RoleKey): string {
  return ROLE_LABELS[role] ?? role.replace(/_/g, " ");
}

/** Cadence keys humanize cleanly today ("plan_guidance" → "Plan guidance"). */
export function cadenceLabel(key: string): string {
  return humanize(key);
}

export function gapLabel(days: number): string {
  return days === 1 ? "1 day" : `${days} days`;
}

/** The audience a floor describes: "standard members and above", "owners only". */
export function audienceLabel(role: RoleKey): string {
  return role === MOST_SENIOR_ROLE ? `${roleLabel(role)} only` : `${roleLabel(role)} and above`;
}

function minimumRoleLabel(rule: MinimumRoleRule): string {
  return humanize(audienceLabel(rule.value));
}

export function ruleLabel(rule: CadenceRule): string {
  if (isMinimumRoleRule(rule)) return minimumRoleLabel(rule);
  return RULE_LABELS[rule.key] ?? humanize(rule.key);
}
