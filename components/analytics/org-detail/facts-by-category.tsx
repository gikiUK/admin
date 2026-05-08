import { useMemo } from "react";
import type { OrgFact } from "@/lib/analytics/api";
import type { FactFormatter } from "@/lib/analytics/fact-formatter";

export function FactsByCategory({ facts, formatter }: { facts: OrgFact[]; formatter: FactFormatter }) {
  const grouped = useMemo(() => {
    const map = new Map<string, ReturnType<FactFormatter>[]>();
    for (const f of facts) {
      const display = formatter(f.key, f.value);
      const list = map.get(display.category) ?? [];
      list.push(display);
      map.set(display.category, list);
    }
    return Array.from(map.entries())
      .map(([category, items]) => ({
        category,
        items: items.slice().sort((a, b) => a.label.localeCompare(b.label))
      }))
      .sort((a, b) => a.category.localeCompare(b.category));
  }, [facts, formatter]);

  return (
    <div className="space-y-5">
      {grouped.map(({ category, items }) => (
        <div key={category} className="space-y-2">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{category}</div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div key={item.key} className="rounded-md border p-2.5">
                <div className="text-sm font-medium leading-tight">{item.label}</div>
                <div className="mt-1 break-words text-sm text-foreground">{item.valueLabel}</div>
                <div className="mt-1 font-mono text-[10px] text-muted-foreground/70">{item.key}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
