"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { type CohortSpec, decodeCohortSpec, encodeCohortSpec } from "@/lib/analytics/insights/cohort-spec";

type CohortContextValue = {
  spec: CohortSpec;
  setSpec: (next: CohortSpec) => void;
  reset: () => void;
};

const CohortContext = createContext<CohortContextValue | null>(null);

const STORAGE_KEY = "giki:insights:cohort";
const PERSIST_DEBOUNCE_MS = 150;

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

  // We can't read localStorage during render: "use client" components still
  // server-render for the initial HTML, so a sync read causes a hydration
  // mismatch whenever storage has data. We also can't read it in a post-mount
  // effect: that gives children one frame with the empty default spec, which
  // lets React Query return a cached "ready" entry for that spec and produces
  // a flash of stale data on first navigation in.
  //
  // Compromise: gate rendering until we've read storage. Server and first
  // client render both return null (no mismatch), and children mount once with
  // the real stored spec already in place (no flash).
  //
  // Cross-tab sync is not supported: if another tab updates localStorage, this
  // tab continues using its mount-time value. Add a `storage` listener if that
  // ever matters.
  const [storedEncoded, setStoredEncoded] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setStoredEncoded(readStoredEncoded());
    setHydrated(true);
  }, []);

  // Local override lets setSpec update the UI immediately while the URL/LS write
  // is debounced. Cleared whenever the URL catches up to the override.
  const [localSpec, setLocalSpec] = useState<CohortSpec | null>(null);

  const persistedSpec = useMemo(() => decodeCohortSpec(urlEncoded ?? storedEncoded), [urlEncoded, storedEncoded]);
  const spec = localSpec ?? persistedSpec;

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingEncodedRef = useRef<string | null>(null);

  const flushPersist = useCallback(() => {
    const encoded = pendingEncodedRef.current;
    if (encoded === null) return;
    pendingEncodedRef.current = null;
    writeStoredEncoded(encoded);
    setStoredEncoded(encoded);
    // Read window.location.search (not searchParams) so we merge against the
    // browser's current URL — searchParams is captured at render time and may
    // be stale by the time this debounced callback fires.
    const params = new URLSearchParams(window.location.search);
    params.set("cohort", encoded);
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [router]);

  // Clear the local override once the persisted spec matches what we wrote.
  // encodeCohortSpec strips incomplete fact filters (empty key / no values), so
  // a freshly-added empty row would appear "in sync" with an empty persistedSpec
  // and get yanked out from under the user mid-edit. Keep the override alive
  // while any incomplete row is present so the row survives the URL/LS write.
  useEffect(() => {
    if (!localSpec) return;
    if (localSpec.fact_filters.some((f) => !f.key || f.values.length === 0)) return;
    if (encodeCohortSpec(localSpec) === encodeCohortSpec(persistedSpec)) {
      setLocalSpec(null);
    }
  }, [localSpec, persistedSpec]);

  // On unmount or page hide, flush any pending encoded spec to localStorage so a
  // setSpec call followed quickly by navigation/close doesn't lose state. We
  // only touch storage (not the router) since router.replace isn't safe during
  // unmount and the URL is already stale at that point anyway.
  useEffect(() => {
    const flushToStorage = () => {
      const encoded = pendingEncodedRef.current;
      if (encoded === null) return;
      pendingEncodedRef.current = null;
      writeStoredEncoded(encoded);
    };
    window.addEventListener("beforeunload", flushToStorage);
    return () => {
      window.removeEventListener("beforeunload", flushToStorage);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      flushToStorage();
    };
  }, []);

  const setSpec = useCallback(
    (next: CohortSpec) => {
      setLocalSpec(next);
      pendingEncodedRef.current = encodeCohortSpec(next);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(flushPersist, PERSIST_DEBOUNCE_MS);
    },
    [flushPersist]
  );

  // Reset clears both the URL param and the saved spec so the next read falls back
  // to DEFAULT_COHORT_SPEC (an empty cohort).
  const reset = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    pendingEncodedRef.current = null;
    setLocalSpec(null);
    writeStoredEncoded(null);
    setStoredEncoded(null);
    const params = new URLSearchParams(window.location.search);
    params.delete("cohort");
    const query = params.toString();
    router.replace(query ? `?${query}` : "?", { scroll: false });
  }, [router]);

  if (!hydrated) return <InsightsHydrationSkeleton />;

  return <CohortContext.Provider value={{ spec, setSpec, reset }}>{children}</CohortContext.Provider>;
}

// Shown only during the SSR pass and the first client render — replaced by real
// content on the next tick once the hydration effect runs. Generic on purpose
// since the provider doesn't know which insights page is mounting.
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
