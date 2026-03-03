"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchBcorpData } from "@/lib/bcorp/api";
import type { BcorpData } from "@/lib/bcorp/types";

export default function BcorpPrintablePage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<BcorpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBcorpData(id)
      .then(setData)
      .catch((err) => {
        if (err instanceof Error && "status" in err && (err as { status: number }).status === 404) {
          setData({});
        } else {
          setError(err instanceof Error ? err.message : "Failed to load data");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-sm text-gray-500">Loading...</div>;
  if (error) return <div className="p-8 text-sm text-red-600">{error}</div>;

  const d = data ?? {};

  return (
    <div className="min-h-screen bg-white p-8 max-w-3xl mx-auto space-y-6 print:p-0">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">The end</h1>
        <p className="text-sm text-gray-500">Organisation ID: {id}</p>
      </div>
    </div>
  );
}
