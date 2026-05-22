import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { DEFAULT_COHORT_SPEC } from "@/lib/analytics/insights/cohort-spec";
import { fetchFactsBreakdown } from "@/lib/analytics/insights/insights-api";
import { useFactsBreakdown } from "@/lib/analytics/insights/use-facts-breakdown";
import { ApiError } from "@/lib/api/client";

jest.mock("@/lib/analytics/insights/insights-api", () => ({
  fetchFactsBreakdown: jest.fn()
}));

const mockFetch = jest.mocked(fetchFactsBreakdown);

function wrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } }
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe("useFactsBreakdown", () => {
  test("returns ready with empty payload when factKeys is empty (no fetch)", () => {
    const { result } = renderHook(() => useFactsBreakdown(DEFAULT_COHORT_SPEC, []), { wrapper: wrapper() });

    expect(result.current).toEqual({ status: "ready", data: { cohort_size: 0, breakdowns: [] } });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test("transitions loading -> ready on success", async () => {
    const payload = {
      cohort_size: 12,
      breakdowns: [{ key: "size", type: "single_select" as const, note: null, values: [] }]
    };
    mockFetch.mockResolvedValue(payload);

    const { result } = renderHook(() => useFactsBreakdown(DEFAULT_COHORT_SPEC, ["size"]), { wrapper: wrapper() });
    expect(result.current.status).toBe("loading");

    await waitFor(() => {
      expect(result.current.status).toBe("ready");
    });
    if (result.current.status !== "ready") throw new Error("unreachable");
    expect(result.current.data).toEqual(payload);
  });

  test("maps a 404 to pending-backend", async () => {
    mockFetch.mockRejectedValue(new ApiError(404, "not yet"));

    const { result } = renderHook(() => useFactsBreakdown(DEFAULT_COHORT_SPEC, ["size"]), { wrapper: wrapper() });

    await waitFor(() => {
      expect(result.current.status).toBe("pending-backend");
    });
  });

  test("maps other failures to error", async () => {
    mockFetch.mockRejectedValue(new Error("boom"));

    const { result } = renderHook(() => useFactsBreakdown(DEFAULT_COHORT_SPEC, ["size"]), { wrapper: wrapper() });

    await waitFor(() => {
      expect(result.current.status).toBe("error");
    });
    if (result.current.status !== "error") throw new Error("unreachable");
    expect(result.current.message).toBe("boom");
  });
});
