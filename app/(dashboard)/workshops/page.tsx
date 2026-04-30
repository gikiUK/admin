"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { WorkshopsTable } from "@/components/workshops/workshops-table";
import { fetchWorkshops, type Workshop } from "@/lib/workshops/api";

export default function WorkshopsPage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback((p: number) => {
    setLoading(true);
    fetchWorkshops(p)
      .then((data) => {
        setWorkshops(data.workshops);
        setTotalPages(data.meta.total_pages);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load(page);
  }, [load, page]);

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
      {loading && <p className="text-muted-foreground text-sm">Loading…</p>}
      {error && <p className="text-destructive text-sm">{error}</p>}
      {!loading && !error && (
        <WorkshopsTable workshops={workshops} page={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
