"use client";

import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
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

function formatFactValue(value: unknown): string {
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

function FactsSection({ facts }: { facts: OrgFact[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Facts ({facts.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {facts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No facts derived for this organisation yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {facts.map((fact) => (
              <div key={fact.key} className="rounded-md border p-2">
                <div className="font-mono text-xs text-muted-foreground">{fact.key}</div>
                <div className="mt-0.5 break-words text-sm">{formatFactValue(fact.value)}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
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
