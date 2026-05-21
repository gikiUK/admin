import { act, renderHook } from "@testing-library/react";
import { usePersistentKeys } from "@/lib/analytics/insights/use-persistent-keys";

const STORAGE_KEY = "test:keys";

beforeEach(() => {
  window.localStorage.clear();
});

describe("usePersistentKeys", () => {
  test("returns defaults when nothing is stored", () => {
    const { result } = renderHook(() => usePersistentKeys(STORAGE_KEY, ["a", "b"]));
    expect(result.current[0]).toEqual(["a", "b"]);
  });

  test("hydrates from localStorage on mount", () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(["x", "y", "z"]));
    const { result } = renderHook(() => usePersistentKeys(STORAGE_KEY, ["a"]));
    expect(result.current[0]).toEqual(["x", "y", "z"]);
  });

  test("preserves an empty stored array (user removed all keys)", () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    const { result } = renderHook(() => usePersistentKeys(STORAGE_KEY, ["default"]));
    expect(result.current[0]).toEqual([]);
  });

  test("falls back to defaults when stored JSON is corrupted", () => {
    window.localStorage.setItem(STORAGE_KEY, "{not json");
    const { result } = renderHook(() => usePersistentKeys(STORAGE_KEY, ["a", "b"]));
    expect(result.current[0]).toEqual(["a", "b"]);
  });

  test("falls back to defaults when stored value is not an array", () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ not: "array" }));
    const { result } = renderHook(() => usePersistentKeys(STORAGE_KEY, ["a"]));
    expect(result.current[0]).toEqual(["a"]);
  });

  test("falls back to defaults when array contains non-strings", () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(["ok", 42, "also-ok"]));
    const { result } = renderHook(() => usePersistentKeys(STORAGE_KEY, ["fallback"]));
    expect(result.current[0]).toEqual(["fallback"]);
  });

  test("setKeys updates state and persists to localStorage", () => {
    const { result } = renderHook(() => usePersistentKeys(STORAGE_KEY, []));
    act(() => {
      result.current[1](["new", "values"]);
    });
    expect(result.current[0]).toEqual(["new", "values"]);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(["new", "values"]));
  });

  test("setKeys can clear to an empty array", () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(["a", "b"]));
    const { result } = renderHook(() => usePersistentKeys(STORAGE_KEY, []));
    act(() => {
      result.current[1]([]);
    });
    expect(result.current[0]).toEqual([]);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("[]");
  });
});
