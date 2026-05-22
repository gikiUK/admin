import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { CohortProvider, useCohort } from "@/lib/analytics/insights/cohort-context";
import { type CohortSpec, encodeCohortSpec } from "@/lib/analytics/insights/cohort-spec";

const STORAGE_KEY = "giki:insights:cohort";

const routerReplace = jest.fn();
let mockSearchParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: (...args: unknown[]) => routerReplace(...args) }),
  useSearchParams: () => mockSearchParams
}));

function specWithKey(key: string, value: string): CohortSpec {
  return {
    org_filters: {},
    fact_filters: [{ id: "f1", key, values: [value] }]
  };
}

function wrapper({ children }: { children: ReactNode }) {
  return <CohortProvider>{children}</CohortProvider>;
}

function setUrlSearch(search: string) {
  mockSearchParams = new URLSearchParams(search);
  window.history.replaceState(null, "", `/?${search}`);
}

beforeEach(() => {
  jest.useFakeTimers();
  window.localStorage.clear();
  routerReplace.mockClear();
  setUrlSearch("");
});

afterEach(() => {
  jest.useRealTimers();
});

describe("CohortProvider", () => {
  test("rapid setSpec calls coalesce into a single router.replace", () => {
    const { result } = renderHook(() => useCohort(), { wrapper });

    act(() => {
      result.current.setSpec(specWithKey("country", "US"));
      result.current.setSpec(specWithKey("country", "FR"));
      result.current.setSpec(specWithKey("country", "DE"));
    });

    // Override is visible immediately, but no router/LS write yet.
    expect(result.current.spec.fact_filters[0]?.values).toEqual(["DE"]);
    expect(routerReplace).not.toHaveBeenCalled();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();

    act(() => {
      jest.advanceTimersByTime(150);
    });

    expect(routerReplace).toHaveBeenCalledTimes(1);
    const finalEncoded = encodeCohortSpec(specWithKey("country", "DE"));
    expect(routerReplace).toHaveBeenCalledWith(`?cohort=${encodeURIComponent(finalEncoded)}`, { scroll: false });
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe(finalEncoded);
  });

  test("unmount mid-debounce flushes pending spec to localStorage but not the router", () => {
    const { result, unmount } = renderHook(() => useCohort(), { wrapper });

    const next = specWithKey("country", "US");
    act(() => {
      result.current.setSpec(next);
    });

    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();

    unmount();

    expect(window.localStorage.getItem(STORAGE_KEY)).toBe(encodeCohortSpec(next));
    // Router was not called — only LS is safe to touch during unmount.
    expect(routerReplace).not.toHaveBeenCalled();
  });

  test("reset cancels a pending debounced flush", () => {
    const { result } = renderHook(() => useCohort(), { wrapper });

    act(() => {
      result.current.setSpec(specWithKey("country", "US"));
    });
    act(() => {
      result.current.reset();
    });
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // The setSpec write must not land after reset — only the reset's own
    // router.replace should be visible.
    expect(routerReplace).toHaveBeenCalledTimes(1);
    expect(routerReplace).toHaveBeenCalledWith("?", { scroll: false });
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  test("beforeunload writes pending encoded spec to localStorage", () => {
    const { result } = renderHook(() => useCohort(), { wrapper });

    const next = specWithKey("country", "US");
    act(() => {
      result.current.setSpec(next);
    });

    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();

    act(() => {
      window.dispatchEvent(new Event("beforeunload"));
    });

    expect(window.localStorage.getItem(STORAGE_KEY)).toBe(encodeCohortSpec(next));
  });

  test("initial spec reflects localStorage value present before mount", () => {
    const stored = specWithKey("country", "JP");
    window.localStorage.setItem(STORAGE_KEY, encodeCohortSpec(stored));

    const { result } = renderHook(() => useCohort(), { wrapper });

    expect(result.current.spec.fact_filters[0]?.key).toBe("country");
    expect(result.current.spec.fact_filters[0]?.values).toEqual(["JP"]);
  });

  test("incomplete fact filter row survives the debounced persist", () => {
    const { result, rerender } = renderHook(() => useCohort(), { wrapper });

    const incomplete: CohortSpec = {
      org_filters: {},
      fact_filters: [{ id: "draft", key: "", values: [] }]
    };
    act(() => {
      result.current.setSpec(incomplete);
    });

    expect(result.current.spec.fact_filters).toHaveLength(1);

    act(() => {
      jest.advanceTimersByTime(150);
    });
    rerender();

    expect(result.current.spec.fact_filters).toHaveLength(1);
    expect(result.current.spec.fact_filters[0]?.key).toBe("");
  });

  test("local override clears once the persisted spec catches up via URL", () => {
    const { result, rerender } = renderHook(() => useCohort(), { wrapper });

    const next = specWithKey("country", "US");
    act(() => {
      result.current.setSpec(next);
    });

    // Override active: setSpec value is visible before the URL has changed.
    expect(result.current.spec.fact_filters[0]?.values).toEqual(["US"]);

    // Simulate Next router updating searchParams with what flushPersist wrote.
    const encoded = encodeCohortSpec(next);
    setUrlSearch(`cohort=${encodeURIComponent(encoded)}`);
    act(() => {
      jest.advanceTimersByTime(150);
    });
    rerender();

    // Still resolves to the same spec — but now from persistedSpec, not localSpec.
    expect(result.current.spec.fact_filters[0]?.values).toEqual(["US"]);

    // Changing the URL out from under us (e.g. back button) should now win,
    // because the override was cleared.
    const other = specWithKey("country", "FR");
    setUrlSearch(`cohort=${encodeURIComponent(encodeCohortSpec(other))}`);
    rerender();
    expect(result.current.spec.fact_filters[0]?.values).toEqual(["FR"]);
  });
});
