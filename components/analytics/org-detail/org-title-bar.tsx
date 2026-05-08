import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { AnalyticsOrganizationDetail, OrgStatus } from "@/lib/analytics/api";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<OrgStatus, string> = {
  active: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  dormant: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  churned: "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400",
  trial: "border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400",
  onboarding: "border-violet-500/40 bg-violet-500/10 text-violet-600 dark:text-violet-400"
};

export function OrgTitleBar({ org }: { org: AnalyticsOrganizationDetail }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <h1 className="text-2xl font-semibold tracking-tight">{org.name}</h1>
      <Badge variant="outline" className={cn("text-xs capitalize", STATUS_STYLES[org.status])}>
        {org.status}
      </Badge>
      <Badge variant="outline" className="text-xs capitalize">
        {org.subscription_tier}
        {org.in_trial && <span className="ml-1 text-muted-foreground">· trial</span>}
      </Badge>
      <span className="text-xs text-muted-foreground">{org.slug}</span>
      <Link
        href={`/manage/organisations/${encodeURIComponent(org.slug)}`}
        className="ml-auto inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs hover:bg-muted"
      >
        Manage
        <ExternalLink className="size-3" />
      </Link>
    </div>
  );
}
