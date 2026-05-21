import {
  type CohortSpec,
  DEFAULT_COHORT_SPEC,
  decodeCohortSpec,
  encodeCohortSpec,
  isEmptySpec,
  newFactFilterId
} from "@/lib/analytics/insights/cohort-spec";

describe("newFactFilterId", () => {
  test("returns a non-empty string", () => {
    const id = newFactFilterId();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });

  test("returns unique ids across calls", () => {
    const ids = new Set(Array.from({ length: 20 }, () => newFactFilterId()));
    expect(ids.size).toBe(20);
  });
});

describe("encodeCohortSpec / decodeCohortSpec", () => {
  test("default spec is empty", () => {
    expect(isEmptySpec(DEFAULT_COHORT_SPEC)).toBe(true);
  });

  test("null encoded → default spec", () => {
    expect(decodeCohortSpec(null)).toEqual(DEFAULT_COHORT_SPEC);
  });

  test("roundtrip preserves org_filters and fact_filters", () => {
    const spec: CohortSpec = {
      org_filters: {
        tier: ["premium"],
        subscription_status: ["active"],
        tags_include: ["climate"],
        has_tracked_actions: true
      },
      fact_filters: [{ id: "ff_a", key: "org.size", values: [6, 7] }]
    };
    const roundtripped = decodeCohortSpec(encodeCohortSpec(spec));
    expect(roundtripped).toEqual(spec);
  });

  test("encode trims empty fact_filters (no key or no values)", () => {
    const spec: CohortSpec = {
      org_filters: {},
      fact_filters: [
        { id: "a", key: "", values: [] }, // dropped: empty key
        { id: "b", key: "org.size", values: [] }, // dropped: empty values
        { id: "c", key: "org.sector", values: ["tech"] } // kept
      ]
    };
    const decoded = decodeCohortSpec(encodeCohortSpec(spec));
    expect(decoded.fact_filters).toEqual([{ id: "c", key: "org.sector", values: ["tech"] }]);
  });

  test("decode backfills missing fact_filter ids", () => {
    // Simulate an older URL where filters were stored without ids.
    const legacyJson = JSON.stringify({
      org_filters: {},
      fact_filters: [
        { key: "org.size", values: [6] },
        { key: "org.sector", values: ["tech"] }
      ]
    });
    const encoded = btoa(encodeURIComponent(legacyJson));
    const decoded = decodeCohortSpec(encoded);
    expect(decoded.fact_filters).toHaveLength(2);
    expect(decoded.fact_filters[0].id).toBeTruthy();
    expect(decoded.fact_filters[1].id).toBeTruthy();
    expect(decoded.fact_filters[0].id).not.toBe(decoded.fact_filters[1].id);
    expect(decoded.fact_filters[0].key).toBe("org.size");
    expect(decoded.fact_filters[1].key).toBe("org.sector");
  });

  test("malformed encoded payload → default spec (no throw)", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    expect(decodeCohortSpec("not-base64-!@#")).toEqual(DEFAULT_COHORT_SPEC);
    warnSpy.mockRestore();
  });

  test("isEmptySpec ignores empty arrays/objects but flags any non-default", () => {
    expect(isEmptySpec({ org_filters: {}, fact_filters: [] })).toBe(true);
    expect(isEmptySpec({ org_filters: { tier: [] }, fact_filters: [] })).toBe(true);
    expect(isEmptySpec({ org_filters: { tier: ["premium"] }, fact_filters: [] })).toBe(false);
    expect(
      isEmptySpec({
        org_filters: {},
        fact_filters: [{ id: "a", key: "k", values: ["v"] }]
      })
    ).toBe(false);
  });
});
