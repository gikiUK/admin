"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Pager } from "@/components/ui/pager";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { signupLinkCompaniesQuery } from "@/lib/signup-links/queries";
import { formatShortDateTime } from "../format";

type Props = {
  uuid: string;
};

export function CompaniesPanel({ uuid }: Props) {
  const [page, setPage] = useState(1);
  const query = useQuery(signupLinkCompaniesQuery(uuid, { page }));

  const companies = query.data?.results ?? [];
  const meta = query.data?.meta;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">Companies that signed up via this link</h2>
        {meta && <Badge variant="secondary">{meta.total_count}</Badge>}
      </div>
      {query.isPending && <p className="text-muted-foreground text-sm">Loading…</p>}
      {query.isError && (
        <p className="text-destructive text-sm">
          {query.error instanceof Error ? query.error.message : "Failed to load companies"}
        </p>
      )}
      {!query.isPending && !query.isError && (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Created at</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No companies signed up yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  companies.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">
                        <Link href={`/manage/organisations/${c.slug}`} className="hover:underline">
                          {c.name}
                        </Link>
                      </TableCell>
                      <TableCell>{c.members_count}</TableCell>
                      <TableCell>{formatShortDateTime(c.created_at)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {meta && meta.total_pages > 1 && (
            <Pager page={page} totalPages={meta.total_pages} totalCount={meta.total_count} onPageChange={setPage} />
          )}
        </>
      )}
    </section>
  );
}
