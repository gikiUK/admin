import { sanitizeFilename } from "@/lib/api/client";

describe("sanitizeFilename", () => {
  test("returns clean filenames unchanged", () => {
    expect(sanitizeFilename("report.csv")).toBe("report.csv");
    expect(sanitizeFilename("cohort_2026-05.csv")).toBe("cohort_2026-05.csv");
  });

  test("trims surrounding whitespace", () => {
    expect(sanitizeFilename("  report.csv  ")).toBe("report.csv");
  });

  test("strips path separators (traversal attempts)", () => {
    expect(sanitizeFilename("../../etc/passwd")).toBe("....etcpasswd");
    expect(sanitizeFilename("..\\..\\windows\\system32")).toBe("....windowssystem32");
    expect(sanitizeFilename("foo/bar.csv")).toBe("foobar.csv");
  });

  test("strips ASCII control characters", () => {
    expect(sanitizeFilename("evil\x00.csv")).toBe("evil.csv");
    expect(sanitizeFilename("a\x01b\x1fc.csv")).toBe("abc.csv");
    expect(sanitizeFilename("line\nbreak.csv")).toBe("linebreak.csv");
  });

  test("returns null when stripping leaves nothing", () => {
    expect(sanitizeFilename("")).toBeNull();
    expect(sanitizeFilename("///")).toBeNull();
    expect(sanitizeFilename("\\\\\\")).toBeNull();
    expect(sanitizeFilename("\x00\x01\x02")).toBeNull();
    expect(sanitizeFilename("   ")).toBeNull();
  });

  test("truncates to 255 characters", () => {
    const long = `${"a".repeat(300)}.csv`;
    const result = sanitizeFilename(long);
    expect(result).not.toBeNull();
    expect(result?.length).toBe(255);
    expect(result?.startsWith("aaaa")).toBe(true);
  });

  test("preserves names exactly at the 255-char boundary", () => {
    const exact = "a".repeat(255);
    expect(sanitizeFilename(exact)).toBe(exact);
  });

  test("preserves unicode characters", () => {
    expect(sanitizeFilename("café-résumé.csv")).toBe("café-résumé.csv");
  });
});
