"use client";

import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  type AnalyticsOrganizationDetail,
  fetchOrganization,
  type OrgFact,
  type OrgMember,
  type OrgStatus,
  type OrgTrackedAction
} from "@/lib/analytics/api";
import { type FactFormatter, makeFactFormatter } from "@/lib/analytics/fact-formatter";
import { useLiveDataset } from "@/lib/analytics/use-live-dataset";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<OrgStatus, string> = {
  active: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  dormant: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  churned: "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400",
  trial: "border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400",
  onboarding: "border-violet-500/40 bg-violet-500/10 text-violet-600 dark:text-violet-400"
};

const TRACKED_STATUS_STYLES: Record<string, string> = {
  not_started: "border-muted-foreground/30 bg-muted text-muted-foreground",
  in_progress: "border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400",
  completed: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  archived: "border-muted-foreground/30 bg-muted text-muted-foreground",
  rejected: "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400"
};

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function formatRawFactValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) return value.length === 0 ? "[]" : value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

type OrgDetailProps = {
  slug: string;
  onBack: () => void;
};

export function OrgDetail({ slug, onBack }: OrgDetailProps) {
  const [data, setData] = useState<AnalyticsOrganizationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetchOrganization(slug)
      .then((response) => setData(response.organization))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load organisation"))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-1 size-4" />
          Back to all organisations
        </Button>
      </div>

      {loading && <div className="text-sm text-muted-foreground">Loading organisation…</div>}
      {error && <div className="text-sm text-destructive">{error}</div>}

      {data && (
        <>
          <OrgHeader org={data} />
          <PlanSummarySection org={data} />
          <FactsSection facts={data.facts} />
          <MembersSection members={data.members} />
          <TrackedActionsSection actions={data.tracked_actions} />
        </>
      )}
    </div>
  );
}

function OrgHeader({ org }: { org: AnalyticsOrganizationDetail }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-semibold">{org.name}</h2>
        <Badge variant="outline" className={cn("text-xs capitalize", STATUS_STYLES[org.status])}>
          {org.status}
        </Badge>
        <Badge variant="outline" className="text-xs capitalize">
          {org.subscription_tier}
          {org.in_trial && <span className="ml-1 text-muted-foreground">· trial</span>}
        </Badge>
        <span className="text-xs text-muted-foreground">{org.slug}</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        <Stat label="Members" value={org.member_count.toLocaleString()} />
        <Stat label="Events" value={org.event_count.toLocaleString()} />
        <Stat
          label="Actions"
          value={`${org.tracked_actions_completed}/${org.tracked_actions_total}`}
          hint={org.tracked_actions_total > 0 ? formatPercent(org.completion_rate) : undefined}
        />
        <Stat label="Signed up" value={formatDate(org.signed_up_at)} />
        <Stat label="Upgraded" value={formatDate(org.upgraded_at)} />
        <Stat label="Last active" value={formatDateTime(org.last_active_at)} />
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
      {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

const STATUS_BAR_SEGMENTS: Array<{ key: string; label: string; className: string }> = [
  { key: "completed", label: "Completed", className: "bg-emerald-500" },
  { key: "in_progress", label: "In progress", className: "bg-sky-500" },
  { key: "not_started", label: "Not started", className: "bg-muted-foreground/40" },
  { key: "rejected", label: "Not relevant", className: "bg-rose-500" },
  { key: "archived", label: "Archived", className: "bg-muted-foreground/20" }
];

const PRE_GIKI_BAR_SEGMENTS: Array<{ key: string; label: string; className: string }> = [
  { key: "already_doing", label: "Already doing", className: "bg-violet-500" },
  { key: "previously_done", label: "Previously done", className: "bg-violet-500/50" }
];

function PlanSummarySection({ org }: { org: AnalyticsOrganizationDetail }) {
  const actions = org.tracked_actions;
  const total = actions.length;
  const byStatus = actions.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {});
  const byPreGiki = actions.reduce<Record<string, number>>((acc, a) => {
    if (a.pre_giki_status) acc[a.pre_giki_status] = (acc[a.pre_giki_status] ?? 0) + 1;
    return acc;
  }, {});
  const preGikiTotal = (byPreGiki.already_doing ?? 0) + (byPreGiki.previously_done ?? 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Plan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <StackedBar
          title="Action status"
          total={total}
          totalLabel={`${total.toLocaleString()} actions`}
          segments={STATUS_BAR_SEGMENTS.map((s) => ({ ...s, count: byStatus[s.key] ?? 0 }))}
          rightLabel={total > 0 ? `${formatPercent(org.completion_rate)} complete` : undefined}
        />
        {preGikiTotal > 0 && (
          <StackedBar
            title="Onboarding pre-giki"
            total={preGikiTotal}
            totalLabel={`${preGikiTotal.toLocaleString()} of ${total.toLocaleString()} flagged`}
            segments={PRE_GIKI_BAR_SEGMENTS.map((s) => ({ ...s, count: byPreGiki[s.key] ?? 0 }))}
          />
        )}
      </CardContent>
    </Card>
  );
}

type StackedBarSegment = { key: string; label: string; className: string; count: number };

function StackedBar({
  title,
  total,
  totalLabel,
  segments,
  rightLabel
}: {
  title: string;
  total: number;
  totalLabel: string;
  segments: StackedBarSegment[];
  rightLabel?: string;
}) {
  const visible = segments.filter((s) => s.count > 0);
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-medium text-foreground">{title}</span>
        <span className="text-muted-foreground">
          {totalLabel}
          {rightLabel && <span className="ml-2 text-foreground">· {rightLabel}</span>}
        </span>
      </div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
        {total === 0
          ? null
          : visible.map((s) => (
              <div
                key={s.key}
                className={cn("h-full", s.className)}
                style={{ width: `${(s.count / total) * 100}%` }}
                title={`${s.label}: ${s.count}`}
              />
            ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {segments.map((s) => (
          <span key={s.key} className={cn("inline-flex items-center gap-1.5", s.count === 0 && "opacity-40")}>
            <span className={cn("inline-block size-2 rounded-sm", s.className)} />
            <span>{s.label}</span>
            <span className="font-mono text-foreground">{s.count}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function FactsSection({ facts }: { facts: OrgFact[] }) {
  const { data: dataset, loading: datasetLoading } = useLiveDataset();
  const formatter = useMemo<FactFormatter | null>(() => (dataset ? makeFactFormatter(dataset.data) : null), [dataset]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Facts ({facts.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {facts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No facts derived for this organisation yet.</p>
        ) : formatter ? (
          <FactsByCategory facts={facts} formatter={formatter} />
        ) : (
          <FactsRawList facts={facts} loading={datasetLoading} />
        )}
      </CardContent>
    </Card>
  );
}

function FactsByCategory({ facts, formatter }: { facts: OrgFact[]; formatter: FactFormatter }) {
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

function FactsRawList({ facts, loading }: { facts: OrgFact[]; loading: boolean }) {
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

function MembersSection({ members }: { members: OrgMember[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Members ({members.length})</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead className="w-[100px]">Role</TableHead>
              <TableHead className="w-[100px] text-right">Events</TableHead>
              <TableHead className="w-[160px]">Last active</TableHead>
              <TableHead className="w-[140px]">Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No members.
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="font-medium">{member.name || "(unnamed)"}</div>
                    <div className="text-xs text-muted-foreground">{member.email}</div>
                  </TableCell>
                  <TableCell className="text-xs capitalize">{member.role}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{member.event_count.toLocaleString()}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDateTime(member.last_active_at)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(member.joined_at)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function TrackedActionsSection({ actions }: { actions: OrgTrackedAction[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Tracked actions ({actions.length})</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[140px]">Assignee</TableHead>
              <TableHead className="w-[120px]">Due</TableHead>
              <TableHead className="w-[160px]">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {actions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No tracked actions.
                </TableCell>
              </TableRow>
            ) : (
              actions.map((action) => (
                <TableRow key={action.id}>
                  <TableCell>
                    <div className="font-medium">{action.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {action.action_type === "Company::CustomAction" ? "Custom" : "System"}
                      {action.pre_giki_status && <span className="ml-1">· pre-giki: {action.pre_giki_status}</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs capitalize",
                        TRACKED_STATUS_STYLES[action.status] ?? TRACKED_STATUS_STYLES.not_started
                      )}
                    >
                      {action.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {action.assignee_name || <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(action.due_date)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDateTime(action.updated_at)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
