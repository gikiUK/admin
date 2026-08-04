import { Pencil } from "lucide-react";
import Link from "next/link";
import { EnabledBadge } from "@/components/cadence-emails/enabled-badge";
import { RuleList } from "@/components/cadence-emails/rule-list";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { extraRules } from "@/lib/cadence-emails/extra-rules";
import type { Cadence, CadenceRule } from "@/lib/cadence-emails/types";

export function CadenceEmailsTable({ cadence }: { cadence: Cadence }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">#</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead className="w-44">Rules</TableHead>
          <TableHead className="w-28">Status</TableHead>
          <TableHead className="w-16 text-right">Edit</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cadence.emails.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground">
              No emails seeded for this cadence.
            </TableCell>
          </TableRow>
        ) : (
          cadence.emails.map((email) => (
            <TableRow key={email.key} className={email.enabled ? undefined : "text-muted-foreground"}>
              <TableCell className="text-muted-foreground tabular-nums">{email.position}</TableCell>
              <TableCell className="text-xs font-medium whitespace-normal">
                <Link href={`/manage/cadence-emails/${email.key}`} className="hover:underline">
                  {email.subject}
                </Link>
              </TableCell>
              <TableCell className="whitespace-normal">
                <ExtraRules rules={extraRules(email.rules, cadence.rules)} />
              </TableCell>
              <TableCell>
                <EnabledBadge enabled={email.enabled} />
              </TableCell>
              <TableCell className="text-right">
                <Button asChild variant="ghost" size="icon" className="size-7" aria-label={`Edit ${email.subject}`}>
                  <Link href={`/manage/cadence-emails/${email.key}`}>
                    <Pencil className="size-3.5" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

function ExtraRules({ rules }: { rules: CadenceRule[] }) {
  if (rules.length === 0) return <span className="text-muted-foreground text-xs">Everyone in the cadence</span>;

  return (
    <span className="text-xs">
      <RuleList rules={rules} />
    </span>
  );
}
