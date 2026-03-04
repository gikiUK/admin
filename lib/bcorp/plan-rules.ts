import type { Plan } from "./types";

type RuleResult = {
  data: Record<string, string>;
  reasoning: Record<string, string>;
};

type Rule = {
  field: string;
  match: (title: string) => boolean;
};

const RULES: Rule[] = [
  {
    field: "policy_travel",
    match: (t) => /commut|travel policy|sustainable travel/i.test(t)
  },
  {
    field: "policy_supplier_code",
    match: (t) => /contractual clauses.*supplier|supplier.*net zero|supplier.*contract/i.test(t)
  }
];

export function deriveFromPlan(plan: Plan): RuleResult {
  const data: Record<string, string> = {};
  const reasoning: Record<string, string> = {};

  for (const rule of RULES) {
    const match = plan.find((a) => a.state === "completed" && rule.match(a.tal_action.title));
    if (match) {
      data[rule.field] = "yes";
      reasoning[rule.field] = `Derived from completed plan action: "${match.tal_action.title}"`;
    }
  }

  return { data, reasoning };
}
