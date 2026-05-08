import type { AnalyticsOrganizationDetail } from "@/lib/analytics/api";
import { cn } from "@/lib/utils";
import { formatDateTime, formatPercent } from "./format";

export const SECTIONS = ["activity", "members", "actions", "facts"] as const;
export type SectionId = (typeof SECTIONS)[number];

export function isSectionId(value: string | null): value is SectionId {
  return value !== null && (SECTIONS as readonly string[]).includes(value);
}

const KPI_TILE_BASE = "flex h-full min-h-[84px] flex-col items-start rounded-md border p-3 text-left";

type KpiStripProps = {
  org: AnalyticsOrganizationDetail;
  activeSection: SectionId;
  onSelect: (next: SectionId) => void;
};

export function KpiStrip({ org, activeSection, onSelect }: KpiStripProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <KpiTab
        label="Activity"
        value={org.event_count.toLocaleString()}
        hint="events"
        active={activeSection === "activity"}
        onClick={() => onSelect("activity")}
      />
      <KpiTab
        label="Members"
        value={org.member_count.toLocaleString()}
        active={activeSection === "members"}
        onClick={() => onSelect("members")}
      />
      <KpiTab
        label="Actions"
        value={`${org.tracked_actions_completed}/${org.tracked_actions_total}`}
        hint={org.tracked_actions_total > 0 ? formatPercent(org.completion_rate) : undefined}
        active={activeSection === "actions"}
        onClick={() => onSelect("actions")}
      />
      <KpiTab
        label="Facts"
        value={org.facts.length.toLocaleString()}
        active={activeSection === "facts"}
        onClick={() => onSelect("facts")}
      />
      <KpiInfo label="Last active" value={formatDateTime(org.last_active_at)} />
    </div>
  );
}

type KpiTabProps = {
  label: string;
  value: string;
  hint?: string;
  active: boolean;
  onClick: () => void;
};

function KpiTab({ label, value, hint, active, onClick }: KpiTabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        KPI_TILE_BASE,
        "cursor-pointer transition-colors hover:bg-muted/50",
        active && "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
      )}
    >
      <div className={cn("text-xs", active ? "text-primary" : "text-muted-foreground")}>{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
      {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
    </button>
  );
}

function KpiInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className={KPI_TILE_BASE}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}
