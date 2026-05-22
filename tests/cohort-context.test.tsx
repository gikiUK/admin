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
  window.localStorage.clear();
  routerReplace.mockClear();
  setUrlSearch("");
});

describe("CohortProvider", () => {
  test("setDraft updates draft only; URL/localStorage stay on applied", () => {
    const { result } = renderHook(() => useCohort(), { wrapper });

    act(() => {
      result.current.setDraft(specWithKey("country", "US"));
    });

    expect(result.current.draft.fact_filters[0]?.values).toEqual(["US"]);
    expect(result.current.applied.fact_filters).toEqual([]);
    expect(result.current.hasUnsavedChanges).toBe(true);
    expect(routerReplace).not.toHaveBeenCalled();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  test("apply() commits the current draft to URL + localStorage and clears hasUnsavedChanges", () => {
    const { result } = renderHook(() => useCohort(), { wrapper });

    const next = specWithKey("country", "US");
    act(() => {
      result.current.setDraft(next);
    });
    act(() => {
      result.current.apply();
    });

    expect(routerReplace).toHaveBeenCalledTimes(1);
    const encoded = encodeCohortSpec(next);
    expect(routerReplace).toHaveBeenCalledWith(`?cohort=${encoded}`, { scroll: false });
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe(encoded);
    expect(result.current.applied.fact_filters[0]?.values).toEqual(["US"]);
    expect(result.current.hasUnsavedChanges).toBe(false);
  });

  test("apply(override) commits the override spec, ignoring the current draft", () => {
    const { result } = renderHook(() => useCohort(), { wrapper });

    act(() => {
      result.current.setDraft(specWithKey("country", "US"));
    });
    const override = specWithKey("country", "FR");
    act(() => {
      result.current.apply(override);
    });

    expect(result.current.applied.fact_filters[0]?.values).toEqual(["FR"]);
    expect(result.current.draft.fact_filters[0]?.values).toEqual(["FR"]);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe(encodeCohortSpec(override));
  });

  test("discard reverts the draft to applied without touching URL/localStorage", () => {
    const { result } = renderHook(() => useCohort(), { wrapper });

    act(() => {
      result.current.setDraft(specWithKey("country", "US"));
    });
    act(() => {
      result.current.discard();
    });

    expect(result.current.draft.fact_filters).toEqual([]);
    expect(result.current.hasUnsavedChanges).toBe(false);
    expect(routerReplace).not.toHaveBeenCalled();
  });

  test("reset clears both draft and applied + URL + localStorage", () => {
    setUrlSearch(`cohort=${encodeCohortSpec(specWithKey("country", "US"))}`);
    const { result, rerender } = renderHook(() => useCohort(), { wrapper });

    act(() => {
      result.current.setDraft(specWithKey("country", "FR"));
    });
    act(() => {
      result.current.reset();
      // In real Next.js router.replace("?") drops the cohort param and useSearchParams updates.
      // Mirror that here so applied recomputes from the empty URL + cleared localStorage.
      setUrlSearch("");
    });
    rerender();

    expect(result.current.applied.fact_filters).toEqual([]);
    expect(result.current.draft.fact_filters).toEqual([]);
    expect(routerReplace).toHaveBeenLastCalledWith("?", { scroll: false });
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  test("initial applied reflects localStorage value present before mount", () => {
    const stored = specWithKey("country", "JP");
    window.localStorage.setItem(STORAGE_KEY, encodeCohortSpec(stored));

    const { result } = renderHook(() => useCohort(), { wrapper });

    expect(result.current.applied.fact_filters[0]?.key).toBe("country");
    expect(result.current.applied.fact_filters[0]?.values).toEqual(["JP"]);
    // draft starts in sync with applied
    expect(result.current.draft.fact_filters[0]?.values).toEqual(["JP"]);
    expect(result.current.hasUnsavedChanges).toBe(false);
  });

  test("incomplete fact filter row stays in the draft until apply strips it", () => {
    const { result } = renderHook(() => useCohort(), { wrapper });

    const incomplete: CohortSpec = {
      org_filters: {},
      fact_filters: [{ id: "draft", key: "", values: [] }]
    };
    act(() => {
      result.current.setDraft(incomplete);
    });

    expect(result.current.draft.fact_filters).toHaveLength(1);

    act(() => {
      result.current.apply();
    });

    // Apply persists the cleaned spec but also drops the incomplete row from draft
    // so the UI stops showing "unsaved changes" for a row that wasn't sent.
    expect(result.current.draft.fact_filters).toHaveLength(0);
    expect(result.current.applied.fact_filters).toHaveLength(0);
  });

  test("URL change from outside (back button) syncs applied AND pulls draft in sync if not edited", () => {
    const { result, rerender } = renderHook(() => useCohort(), { wrapper });

    expect(result.current.applied.fact_filters).toEqual([]);
    expect(result.current.draft.fact_filters).toEqual([]);

    const other = specWithKey("country", "FR");
    setUrlSearch(`cohort=${encodeCohortSpec(other)}`);
    rerender();

    expect(result.current.applied.fact_filters[0]?.values).toEqual(["FR"]);
    expect(result.current.draft.fact_filters[0]?.values).toEqual(["FR"]);
  });
});
