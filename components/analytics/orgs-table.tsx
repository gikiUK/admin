"use client";

import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AnalyticsOrganization, OrgStatus } from "@/lib/analytics/api";
import { cn } from "@/lib/utils";

type OrgsTableProps = {
  organizations: AnalyticsOrganization[];
  onSelect?: (org: AnalyticsOrganization) => void;
};

const STATUS_STYLES: Record<OrgStatus, string> = {
  active: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  dormant: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  churned: "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400",
  trial: "border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400",
  onboarding: "border-violet-500/40 bg-violet-500/10 text-violet-600 dark:text-violet-400"
};

const TIER_STYLES: Record<string, string> = {
  premium: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  standard: "border-muted-foreground/30 bg-muted text-muted-foreground"
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

export function OrgsTable({ organizations, onSelect }: OrgsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Organisation</TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
            <TableHead className="w-[120px]">Tier</TableHead>
            <TableHead className="w-[90px] text-right">Members</TableHead>
            <TableHead className="w-[90px] text-right">Events</TableHead>
            <TableHead className="w-[140px]">Actions</TableHead>
            <TableHead className="w-[160px]">Last active</TableHead>
            <TableHead className="w-[140px]">Signed up</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {organizations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground">
                No organisations found.
              </TableCell>
            </TableRow>
          ) : (
            organizations.map((org) => (
              <TableRow
                key={org.id}
                className={onSelect ? "cursor-pointer hover:bg-muted/50" : undefined}
                onClick={onSelect ? () => onSelect(org) : undefined}
              >
                <TableCell>
                  <div className="font-medium">{org.name}</div>
                  <div className="text-xs text-muted-foreground">{org.slug}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("text-xs capitalize", STATUS_STYLES[org.status])}>
                    {org.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn("text-xs capitalize", TIER_STYLES[org.subscription_tier] ?? TIER_STYLES.standard)}
                  >
                    {org.subscription_tier}
                    {org.in_trial && <span className="ml-1 text-muted-foreground">· trial</span>}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono text-sm">{org.member_count.toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono text-sm">{org.event_count.toLocaleString()}</TableCell>
                <TableCell className="text-xs">
                  <span className="font-mono">
                    {org.tracked_actions_completed}/{org.tracked_actions_total}
                  </span>
                  {org.tracked_actions_total > 0 && (
                    <span className="ml-1 text-muted-foreground">· {formatPercent(org.completion_rate)}</span>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{formatDateTime(org.last_active_at)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{formatDate(org.signed_up_at)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
