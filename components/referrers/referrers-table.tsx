"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { SignupLinkReferrer } from "@/lib/signup-links/types";

type Props = {
  referrers: SignupLinkReferrer[];
};

export function ReferrersTable({ referrers }: Props) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="w-24 text-right">ID</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {referrers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={2} className="text-center text-muted-foreground">
                No referrers yet.
              </TableCell>
            </TableRow>
          ) : (
            referrers.map((referrer) => (
              <TableRow key={referrer.id}>
                <TableCell>{referrer.name}</TableCell>
                <TableCell className="text-right text-muted-foreground">{referrer.id}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
