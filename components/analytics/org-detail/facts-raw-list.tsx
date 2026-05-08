import type { OrgFact } from "@/lib/analytics/api";
import { formatRawFactValue } from "./format";

export function FactsRawList({ facts, loading }: { facts: OrgFact[]; loading: boolean }) {
  return (
    <div className="space-y-2">
      {loading && <p className="text-xs text-muted-foreground">Loading dataset for fact labels…</p>}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {facts.map((fact) => (
          <div key={fact.key} className="rounded-md border p-2">
            <div className="font-mono text-xs text-muted-foreground">{fact.key}</div>
            <div className="mt-0.5 break-words text-sm">{formatRawFactValue(fact.value)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
