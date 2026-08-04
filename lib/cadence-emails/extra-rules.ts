import { findMinimumRoleRule } from "@/lib/cadence-emails/rule-helpers";
import type { CadenceRule } from "@/lib/cadence-emails/types";
import { isMinimumRoleRule } from "@/lib/cadence-emails/types";

/**
 * What an email restricts *beyond* its cadence. An email's rules are already
 * the effective set, so this is a display concern only — we show the cadence's
 * rules once on the card, and per row only what that row adds. An email can be
 * more restrictive than its cadence but never less, so this never hides
 * anything that widens the audience.
 */
export function extraRules(emailRules: CadenceRule[], cadenceRules: CadenceRule[]): CadenceRule[] {
  const cadenceMinimumRole = findMinimumRoleRule(cadenceRules);
  const cadenceKeys = new Set(cadenceRules.map((rule) => rule.key));

  return emailRules.filter((rule) => {
    if (isMinimumRoleRule(rule)) return rule.value !== cadenceMinimumRole?.value;
    return !cadenceKeys.has(rule.key);
  });
}
