import { Fragment } from "react";
import { ruleLabel } from "@/lib/cadence-emails/labels";
import type { CadenceRule } from "@/lib/cadence-emails/types";

/** Rules as prose — the rules themselves picked out, the joining words not. */
export function RuleList({ rules }: { rules: CadenceRule[] }) {
  return (
    <>
      {rules.map((rule, index) => (
        <Fragment key={rule.key}>
          {index > 0 && <span className="text-muted-foreground">{index === rules.length - 1 ? " and " : ", "}</span>}
          <span className="text-primary font-medium">{ruleLabel(rule)}</span>
        </Fragment>
      ))}
    </>
  );
}
