import type { CadenceRule, MinimumRoleRule } from "@/lib/cadence-emails/types";
import { isMinimumRoleRule } from "@/lib/cadence-emails/types";

export function findMinimumRoleRule(rules: CadenceRule[]): MinimumRoleRule | undefined {
  return rules.find(isMinimumRoleRule);
}

/** Rules other than the audience floor, which is rendered as prose instead. */
export function otherRules(rules: CadenceRule[]): CadenceRule[] {
  return rules.filter((rule) => !isMinimumRoleRule(rule));
}
