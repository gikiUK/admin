import { formatShortDate, formatShortDateTime, formatUses } from "@/components/signup-links/format";

describe("formatShortDate", () => {
  test("returns em dash for null", () => {
    expect(formatShortDate(null)).toBe("—");
  });

  test("formats an ISO date string", () => {
    const result = formatShortDate("2026-08-15");
    expect(result).not.toBe("—");
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("formatShortDateTime", () => {
  test("returns em dash for null", () => {
    expect(formatShortDateTime(null)).toBe("—");
  });

  test("formats an ISO timestamp", () => {
    const result = formatShortDateTime("2026-08-15T12:34:56Z");
    expect(result).not.toBe("—");
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("formatUses", () => {
  test("shows just the count when max_uses is null", () => {
    expect(formatUses(3, null)).toBe("3");
  });

  test("shows count / max when max_uses is set", () => {
    expect(formatUses(3, 10)).toBe("3 / 10");
  });

  test("handles zero uses", () => {
    expect(formatUses(0, 5)).toBe("0 / 5");
  });
});
