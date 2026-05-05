"use client";

import type { Dataset } from "@gikiuk/facts-engine";
import { useEffect, useState } from "react";
import { loadLiveDataset } from "@/lib/blob/api-client";

let cached: Dataset | null = null;
let inflight: Promise<Dataset> | null = null;

export function useLiveDataset(): { data: Dataset | null; loading: boolean; error: string } {
  const [data, setData] = useState<Dataset | null>(cached);
  const [loading, setLoading] = useState(cached === null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (cached) return;
    let active = true;
    setLoading(true);
    inflight ??= loadLiveDataset();
    inflight
      .then((d) => {
        cached = d;
        if (active) setData(d);
      })
      .catch((err) => {
        inflight = null;
        if (active) setError(err instanceof Error ? err.message : "Failed to load dataset");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { data, loading, error };
}
