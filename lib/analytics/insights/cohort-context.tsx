"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { createContext, type ReactNode, useCallback, useContext, useMemo } from "react";
import { type CohortSpec, decodeCohortSpec, encodeCohortSpec } from "@/lib/analytics/insights/cohort-spec";

type CohortContextValue = {
  spec: CohortSpec;
  setSpec: (next: CohortSpec) => void;
  reset: () => void;
};

const CohortContext = createContext<CohortContextValue | null>(null);

export function CohortProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const encoded = searchParams.get("cohort");

  const spec = useMemo(() => decodeCohortSpec(encoded), [encoded]);

  const setSpec = useCallback(
    (next: CohortSpec) => {
      const params = new URLSearchParams(searchParams.toString());
      // Always serialize the spec — even when "empty" — so that explicit user removals
      // (e.g. clearing the default "qa" tags_exclude) survive a reload. Falling back to
      // DEFAULT_COHORT_SPEC happens only when there's no ?cohort param at all.
      params.set("cohort", encodeCohortSpec(next));
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  // Reset clears the URL param entirely so the next read falls back to DEFAULT_COHORT_SPEC.
  const reset = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("cohort");
    const query = params.toString();
    router.replace(query ? `?${query}` : "?", { scroll: false });
  }, [router, searchParams]);

  return <CohortContext.Provider value={{ spec, setSpec, reset }}>{children}</CohortContext.Provider>;
}

export function useCohort(): CohortContextValue {
  const value = useContext(CohortContext);
  if (!value) throw new Error("useCohort must be used inside <CohortProvider>");
  return value;
}
