"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { type CohortSpec, decodeCohortSpec, encodeCohortSpec } from "@/lib/analytics/insights/cohort-spec";

type CohortContextValue = {
  /** What queries / URL / localStorage reflect — the "committed" cohort. */
  applied: CohortSpec;
  /** What the editor mutates. Starts equal to `applied`, diverges on setDraft. */
  draft: CohortSpec;
  /** True when draft has uncommitted changes (and they're not just empty/incomplete rows). */
  hasUnsavedChanges: boolean;
  /** Update the draft only. Does not refetch. */
  setDraft: (next: CohortSpec) => void;
  /** Commit `override` (or the current draft) → applied + URL + localStorage. Triggers query refetches. */
  apply: (override?: CohortSpec) => void;
  /** Revert the draft back to applied. */
  discard: () => void;
  /** Clear draft AND applied; URL + localStorage are wiped. Triggers refetches. */
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

  // Hydration: read localStorage only after mount to avoid SSR/CSR mismatch, but
  // gate rendering so children never see an empty default spec for one frame
  // (which would let React Query cache a "ready" entry against the wrong key
  // and produce a flash of stale data).
  const [storedEncoded, setStoredEncoded] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setStoredEncoded(readStoredEncoded());
    setHydrated(true);
  }, []);

  const applied = useMemo(() => decodeCohortSpec(urlEncoded ?? storedEncoded), [urlEncoded, storedEncoded]);

  // Draft mirrors applied on mount and after every apply/reset. setDraft replaces
  // it until the user commits. We store the draft locally rather than recomputing
  // from applied so partially-edited rows (empty key / no values) survive renders.
  const [draft, setDraft] = useState<CohortSpec>(applied);

  // When `applied` changes from outside (URL back/forward, another tab via the
  // storage event we don't currently listen to, etc.), pull the draft back in
  // sync IF the user hasn't made local edits. We compare via encodeCohortSpec to
  // ignore incomplete-row noise.
  const appliedEncoded = useMemo(() => encodeCohortSpec(applied), [applied]);
  const [lastSyncedAppliedEncoded, setLastSyncedAppliedEncoded] = useState(appliedEncoded);
  useEffect(() => {
    if (appliedEncoded === lastSyncedAppliedEncoded) return;
    setDraft(applied);
    setLastSyncedAppliedEncoded(appliedEncoded);
  }, [appliedEncoded, lastSyncedAppliedEncoded, applied]);

  const draftEncoded = useMemo(() => encodeCohortSpec(draft), [draft]);
  const hasUnsavedChanges = draftEncoded !== appliedEncoded;

  const writeApplied = useCallback(
    (next: CohortSpec) => {
      const encoded = encodeCohortSpec(next);
      writeStoredEncoded(encoded);
      setStoredEncoded(encoded);
      // Read window.location.search (not searchParams) so we merge against the
      // browser's current URL — searchParams is captured at render time.
      const params = new URLSearchParams(window.location.search);
      params.set("cohort", encoded);
      router.replace(`?${params.toString()}`, { scroll: false });
      setLastSyncedAppliedEncoded(encoded);
    },
    [router]
  );

  const apply = useCallback(
    (override?: CohortSpec) => {
      const next = override ?? draft;
      // Strip incomplete rows before committing — same shape `encodeCohortSpec`
      // would persist — so the editor doesn't keep showing "unsaved" for a row
      // that won't actually be sent.
      const cleaned: CohortSpec = {
        org_filters: next.org_filters,
        fact_filters: next.fact_filters.filter((f) => f.key && f.values.length > 0)
      };
      setDraft(cleaned);
      writeApplied(cleaned);
    },
    [draft, writeApplied]
  );

  const discard = useCallback(() => {
    setDraft(applied);
  }, [applied]);

  const reset = useCallback(() => {
    const empty: CohortSpec = { org_filters: {}, fact_filters: [] };
    setDraft(empty);
    writeStoredEncoded(null);
    setStoredEncoded(null);
    const params = new URLSearchParams(window.location.search);
    params.delete("cohort");
    const query = params.toString();
    router.replace(query ? `?${query}` : "?", { scroll: false });
    setLastSyncedAppliedEncoded(encodeCohortSpec(empty));
  }, [router]);

  const value = useMemo<CohortContextValue>(
    () => ({ applied, draft, hasUnsavedChanges, setDraft, apply, discard, reset }),
    [applied, draft, hasUnsavedChanges, apply, discard, reset]
  );

  if (!hydrated) return <InsightsHydrationSkeleton />;

  return <CohortContext.Provider value={value}>{children}</CohortContext.Provider>;
}

// Shown only during the SSR pass and the first client render — replaced by real
// content on the next tick once the hydration effect runs.
function InsightsHydrationSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export function useCohort(): CohortContextValue {
  const value = useContext(CohortContext);
  if (!value) throw new Error("useCohort must be used inside <CohortProvider>");
  return value;
}
