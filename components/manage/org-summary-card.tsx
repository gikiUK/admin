import { AccessStatusBadge } from "@/components/manage/access-status-badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ManagedCompany } from "@/lib/manage/api";

type Row = { label: string; value: React.ReactNode };

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

export function OrgSummaryCard({ company }: { company: ManagedCompany }) {
  const rows: Row[] = [
    { label: "Slug", value: <span className="font-mono text-xs">{company.slug}</span> },
    { label: "Access", value: <AccessStatusBadge status={company.access_status} /> },
    { label: "Tier", value: <span className="capitalize">{company.subscription_tier}</span> },
    { label: "Subscription", value: company.subscription_status.replace(/_/g, " ") },
    { label: "Trial ends", value: formatDate(company.trial_ends_at) },
    { label: "Gifted premium until", value: formatDate(company.gifted_premium_until) },
    { label: "Members", value: company.members_count.toLocaleString() },
    { label: "Tracked actions", value: company.tracked_actions_count.toLocaleString() },
    { label: "Created", value: formatDate(company.created_at) }
  ];

  return (
    <Card>
      <CardContent className="grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">{row.label}</span>
            <span className="text-sm">{row.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
