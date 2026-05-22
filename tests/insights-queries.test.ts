import type { UseQueryResult } from "@tanstack/react-query";
import { isPendingBackendError, toInsightsState } from "@/lib/analytics/insights/queries";
import { ApiError } from "@/lib/api/client";

function makeQuery<T>(overrides: Partial<UseQueryResult<T>>): UseQueryResult<T> {
  return {
    data: undefined,
    error: null,
    isError: false,
    isPending: true,
    isFetching: false,
    fetchStatus: "idle",
    ...overrides
  } as UseQueryResult<T>;
}

describe("isPendingBackendError", () => {
  test("true for ApiError 404", () => {
    expect(isPendingBackendError(new ApiError(404, "not yet"))).toBe(true);
  });

  test("false for ApiError 500", () => {
    expect(isPendingBackendError(new ApiError(500, "boom"))).toBe(false);
  });

  test("false for plain Error", () => {
    expect(isPendingBackendError(new Error("nope"))).toBe(false);
  });
});

describe("toInsightsState", () => {
  test("maps an idle/disabled query to ready with emptyData", () => {
    const query = makeQuery<{ count: number }>({ isPending: true, isFetching: false, fetchStatus: "idle" });
    const state = toInsightsState(query, { count: 0 });
    expect(state).toEqual({ status: "ready", data: { count: 0 } });
  });

  test("maps a fetching query to loading", () => {
    const query = makeQuery({ isPending: true, isFetching: true, fetchStatus: "fetching" });
    expect(toInsightsState(query).status).toBe("loading");
  });

  test("maps data present to ready", () => {
    const query = makeQuery<{ n: number }>({
      data: { n: 5 },
      isPending: false,
      isFetching: false,
      fetchStatus: "idle"
    });
    expect(toInsightsState(query)).toEqual({ status: "ready", data: { n: 5 } });
  });

  test("maps ApiError 404 to pending-backend", () => {
    const query = makeQuery({
      isError: true,
      error: new ApiError(404, "missing"),
      isPending: false
    });
    expect(toInsightsState(query).status).toBe("pending-backend");
  });

  test("maps other errors to error with message", () => {
    const query = makeQuery({
      isError: true,
      error: new Error("kaboom"),
      isPending: false
    });
    const state = toInsightsState(query);
    expect(state).toEqual({ status: "error", message: "kaboom" });
  });
});
