"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { createContext, type ReactNode, useCallback, useContext, useMemo } from "react";
import {
  type CohortSpec,
  DEFAULT_COHORT_SPEC,
  decodeCohortSpec,
  encodeCohortSpec,
  isEmptySpec
} from "@/lib/analytics/insights/cohort-spec";

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
      if (isEmptySpec(next)) {
        params.delete("cohort");
      } else {
        params.set("cohort", encodeCohortSpec(next));
      }
      const query = params.toString();
      router.replace(query ? `?${query}` : "?", { scroll: false });
    },
    [router, searchParams]
  );

  const reset = useCallback(() => setSpec(DEFAULT_COHORT_SPEC), [setSpec]);

  return <CohortContext.Provider value={{ spec, setSpec, reset }}>{children}</CohortContext.Provider>;
}

export function useCohort(): CohortContextValue {
  const value = useContext(CohortContext);
  if (!value) throw new Error("useCohort must be used inside <CohortProvider>");
  return value;
}
