"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { WorkshopsTable } from "@/components/workshops/workshops-table";
import { workshopsListQuery } from "@/lib/workshops/queries";

export default function WorkshopsPage() {
  const [page, setPage] = useState(1);
  const query = useQuery(workshopsListQuery(page));

  const workshops = query.data?.workshops ?? [];
  const totalPages = query.data?.meta.total_pages ?? 1;
  const errorMessage = query.isError
    ? query.error instanceof Error
      ? query.error.message
      : "Failed to load workshops"
    : "";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workshops"
        description="Manage webinars and workshop invitees."
        action={
          <Button asChild>
            <Link href="/workshops/new">New Workshop</Link>
          </Button>
        }
      />
      {query.isPending && <p className="text-muted-foreground text-sm">Loading…</p>}
      {errorMessage && <p className="text-destructive text-sm">{errorMessage}</p>}
      {!query.isPending && !errorMessage && (
        <WorkshopsTable workshops={workshops} page={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
