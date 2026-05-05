import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type AtRiskOrgsProps = {
  orgs: Array<{
    company_id: number;
    company_name: string;
    last_activity_at: string | null;
    not_started_count: number;
  }>;
};

function formatRelative(value: string | null): string {
  if (!value) return "Never";
  return new Date(value).toLocaleDateString();
}

export function AtRiskOrgs({ orgs }: AtRiskOrgsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">At-risk orgs</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {orgs.length === 0 ? (
          <div className="px-6 pb-6 text-sm text-muted-foreground">No at-risk orgs.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Last activity</TableHead>
                <TableHead className="text-right">Not started</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orgs.map((org) => (
                <TableRow key={org.company_id}>
                  <TableCell>{org.company_name}</TableCell>
                  <TableCell className="text-muted-foreground">{formatRelative(org.last_activity_at)}</TableCell>
                  <TableCell className="text-right tabular-nums">{org.not_started_count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
