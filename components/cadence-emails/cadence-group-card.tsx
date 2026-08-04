import { ArrowDown } from "lucide-react";
import { CadenceEmailsTable } from "@/components/cadence-emails/cadence-emails-table";
import { CadenceSummary } from "@/components/cadence-emails/cadence-summary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cadenceLabel } from "@/lib/cadence-emails/labels";
import type { Cadence } from "@/lib/cadence-emails/types";

export function CadenceGroupCard({ cadence }: { cadence: Cadence }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {cadenceLabel(cadence.key)}
          <span className="text-muted-foreground text-sm font-normal">
            {cadence.emails.length} {cadence.emails.length === 1 ? "email" : "emails"}
          </span>
        </CardTitle>
        <CardDescription>
          <CadenceSummary cadence={cadence} />
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <ArrowDown className="size-3.5 shrink-0" />
          Listed in send order. Disabled emails are skipped without shifting the rest.
        </p>
        <div className="rounded-md border">
          <CadenceEmailsTable cadence={cadence} />
        </div>
      </CardContent>
    </Card>
  );
}
