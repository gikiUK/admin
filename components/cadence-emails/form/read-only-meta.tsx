import { Lock } from "lucide-react";
import { RuleList } from "@/components/cadence-emails/rule-list";
import { cadenceLabel } from "@/lib/cadence-emails/labels";
import type { CadenceEmail } from "@/lib/cadence-emails/types";

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="font-mono text-sm">{children}</dd>
    </div>
  );
}

export function ReadOnlyMeta({ email }: { email: CadenceEmail }) {
  return (
    <div className="bg-muted/40 space-y-2 rounded-md border p-4">
      <dl className="flex flex-wrap gap-x-10 gap-y-3">
        <Item label="Key">{email.key}</Item>
        <Item label="Cadence">{cadenceLabel(email.cadence_key)}</Item>
        <Item label="Position">{String(email.position)}</Item>
        <Item label="Rules">
          {email.rules.length === 0 ? (
            <span className="text-muted-foreground">None</span>
          ) : (
            <span className="font-sans">
              <RuleList rules={email.rules} />
            </span>
          )}
        </Item>
      </dl>
      <p className="text-muted-foreground flex items-start gap-1.5 text-xs">
        <Lock className="mt-0.5 size-3 shrink-0" />
        Fixed by the API. The key is what guarantees nobody receives this email twice, so it can never change.
      </p>
    </div>
  );
}
