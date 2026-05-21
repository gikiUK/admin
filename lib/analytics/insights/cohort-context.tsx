"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { type CohortSpec, decodeCohortSpec, encodeCohortSpec } from "@/lib/analytics/insights/cohort-spec";

type CohortContextValue = {
  spec: CohortSpec;
  setSpec: (next: CohortSpec) => void;
  reset: () => void;
};

const CohortContext = createContext<CohortContextValue | null>(null);

const STORAGE_KEY = "giki:insights:cohort";

function readStoredEncoded(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredEncoded(encoded: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (encoded === null) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, encoded);
  } catch {
    // Quota / disabled storage — silently ignore; URL still works.
  }
}

export function CohortProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlEncoded = searchParams.get("cohort");

  // localStorage is read once on mount so SSR and the first client render agree
  // (both see `null`), then we hydrate from LS in an effect to avoid a mismatch.
  const [storedEncoded, setStoredEncoded] = useState<string | null>(null);
  useEffect(() => {
    if (urlEncoded === null) setStoredEncoded(readStoredEncoded());
  }, [urlEncoded]);

  const spec = useMemo(() => decodeCohortSpec(urlEncoded ?? storedEncoded), [urlEncoded, storedEncoded]);

  const setSpec = useCallback(
    (next: CohortSpec) => {
      const encoded = encodeCohortSpec(next);
      writeStoredEncoded(encoded);
      setStoredEncoded(encoded);
      const params = new URLSearchParams(searchParams.toString());
      // Always serialize the spec — even when "empty" — so that explicit user removals
      // survive a reload. Falling back to LS / DEFAULT_COHORT_SPEC happens only when
      // there's no ?cohort param at all.
      params.set("cohort", encoded);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  // Reset clears both the URL param and the saved spec so the next read falls back
  // to DEFAULT_COHORT_SPEC (an empty cohort).
  const reset = useCallback(() => {
    writeStoredEncoded(null);
    setStoredEncoded(null);
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
