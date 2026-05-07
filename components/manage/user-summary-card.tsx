import { Card, CardContent } from "@/components/ui/card";
import type { ManagedUser } from "@/lib/manage/api";

type Row = { label: string; value: React.ReactNode };

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

export function UserSummaryCard({ user }: { user: ManagedUser }) {
  const rows: Row[] = [
    { label: "Id", value: <span className="font-mono text-xs">{user.id}</span> },
    { label: "Email", value: user.email },
    { label: "Name", value: user.name || "—" },
    { label: "Confirmed", value: user.confirmed_at ? formatDate(user.confirmed_at) : "Not confirmed" },
    { label: "Email bounced", value: user.email_bounced_at ? formatDate(user.email_bounced_at) : "—" },
    { label: "Last active", value: formatDate(user.last_active_at) },
    { label: "Signed up", value: formatDate(user.signed_up_at) }
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
