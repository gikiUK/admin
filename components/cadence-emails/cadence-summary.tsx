import { RuleList } from "@/components/cadence-emails/rule-list";
import { audienceLabel, gapLabel } from "@/lib/cadence-emails/labels";
import { findMinimumRoleRule, otherRules } from "@/lib/cadence-emails/rule-helpers";
import type { Cadence } from "@/lib/cadence-emails/types";

function Rule({ children }: { children: React.ReactNode }) {
  return <span className="text-primary font-medium">{children}</span>;
}

/**
 * Who's in the cadence, who receives it and how often, with the config-driven
 * bits picked out. Rules that aren't the audience floor are appended after it.
 */
export function CadenceSummary({ cadence }: { cadence: Cadence }) {
  const minimumRole = findMinimumRoleRule(cadence.rules);
  const rest = otherRules(cadence.rules);

  return (
    <span>
      Companies that <Rule>{cadence.entry_condition}</Rule>. Emails go out every{" "}
      <Rule>{gapLabel(cadence.gap_in_days)}</Rule>
      {minimumRole && (
        <>
          , to the company's <Rule>{audienceLabel(minimumRole.value)}</Rule>
        </>
      )}
      .
      {rest.length > 0 && (
        <>
          {" "}
          Also <RuleList rules={rest} />.
        </>
      )}
    </span>
  );
}
