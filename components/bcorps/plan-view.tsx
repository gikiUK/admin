"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { Plan, PlanAction } from "@/lib/bcorp/types";

// ─── constants ───────────────────────────────────────────────────────────────

const STATE_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  completed: { label: "Completed", variant: "default" },
  in_progress: { label: "In progress", variant: "secondary" },
  not_started: { label: "Not started", variant: "outline" }
};

const ALL_STATES = ["completed", "in_progress", "not_started"];

// ─── helpers ─────────────────────────────────────────────────────────────────

function themes(action: PlanAction): string[] {
  return action.tal_action.themes ?? ["Other"];
}

function chip(label: string, value: string | undefined) {
  if (!value || value === "Not applicable") return null;
  return (
    <span key={label} className="text-xs text-muted-foreground">
      {label}: <span className="text-foreground font-medium">{value}</span>
    </span>
  );
}

// ─── ActionCard ──────────────────────────────────────────────────────────────

function ActionCard({ action }: { action: PlanAction }) {
  const [open, setOpen] = useState(false);
  const d = action.tal_action;
  const state = STATE_CONFIG[action.state] ?? { label: action.state, variant: "outline" as const };
  const ghgCats = d.ghg_category ?? [];

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="rounded-md border bg-card">
        <CollapsibleTrigger className="w-full text-left p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1 space-y-2 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <span className="font-medium text-sm leading-snug">{d.title}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={state.variant}>{state.label}</Badge>
                  <ChevronDown
                    className={`size-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                  />
                </div>
              </div>
              {d.summary && <p className="text-sm text-muted-foreground line-clamp-2">{d.summary}</p>}
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4 border-t pt-4">
            {d.benefits && (
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Benefits</p>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{d.benefits}</p>
              </div>
            )}
            {ghgCats.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {ghgCats.map((cat) => (
                  <span key={cat} className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {cat}
                  </span>
                ))}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// ─── ThemeGroup ──────────────────────────────────────────────────────────────

function ThemeGroup({ theme, actions }: { theme: string; actions: PlanAction[] }) {
  const [open, setOpen] = useState(true);
  const started = actions.filter((a) => a.state !== "not_started").length;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center gap-2 py-1 text-left">
        <ChevronDown
          className={`size-4 text-muted-foreground transition-transform duration-200 ${open ? "" : "-rotate-90"}`}
        />
        <span className="font-semibold text-sm">{theme}</span>
        <span className="text-xs text-muted-foreground ml-1">
          {started}/{actions.length} started
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 space-y-2 pl-6">
          {actions.map((action) => (
            <ActionCard key={action.external_action_id} action={action} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ─── FilterBar ───────────────────────────────────────────────────────────────

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background text-muted-foreground hover:bg-muted"
      }`}
    >
      {label}
    </button>
  );
}

// ─── PlanView ─────────────────────────────────────────────────────────────────

export function PlanView({ plan }: { plan: Plan }) {
  const [stateFilter, setStateFilter] = useState<Set<string>>(new Set());

  if (plan.length === 0) {
    return <p className="text-sm text-muted-foreground">No actions in plan.</p>;
  }

  function toggleState(s: string) {
    setStateFilter((prev) => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  }

  const filtered = plan.filter((a) => {
    if (stateFilter.size > 0 && !stateFilter.has(a.state)) return false;
    return true;
  });

  // Group by theme, preserving order of first appearance
  const themeMap = new Map<string, PlanAction[]>();
  for (const action of filtered) {
    for (const theme of themes(action)) {
      if (!themeMap.has(theme)) themeMap.set(theme, []);
      themeMap.get(theme)?.push(action);
    }
  }

  const stateCounts = Object.fromEntries(ALL_STATES.map((s) => [s, plan.filter((a) => a.state === s).length]));

  return (
    <div className="space-y-5">
      {/* Filter bar */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {ALL_STATES.map((s) => {
            const cfg = STATE_CONFIG[s];
            return (
              <FilterChip
                key={s}
                label={`${cfg.label} (${stateCounts[s]})`}
                active={stateFilter.has(s)}
                onClick={() => toggleState(s)}
              />
            );
          })}
        </div>
      </div>

      {/* Results summary */}
      {stateFilter.size > 0 && (
        <p className="text-xs text-muted-foreground">
          Showing {filtered.length} of {plan.length} actions
          <button type="button" className="ml-2 underline hover:no-underline" onClick={() => setStateFilter(new Set())}>
            Clear filters
          </button>
        </p>
      )}

      {/* Theme groups */}
      <div className="space-y-4">
        {themeMap.size === 0 ? (
          <p className="text-sm text-muted-foreground">No actions match the current filters.</p>
        ) : (
          Array.from(themeMap.entries()).map(([theme, actions]) => (
            <ThemeGroup key={theme} theme={theme} actions={actions} />
          ))
        )}
      </div>
    </div>
  );
}
