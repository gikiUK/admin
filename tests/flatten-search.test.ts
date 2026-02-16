import { flattenSearch } from "@/lib/blob/flatten-search";

describe("flattenSearch", () => {
  it("returns empty results for empty query", () => {
    const result = flattenSearch({ foo: "bar" }, "");
    expect(result.matches).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.truncated).toBe(false);
  });

  it("matches a string value", () => {
    const result = flattenSearch({ name: "hello world" }, "hello");
    expect(result.matches).toEqual([{ path: ["name"], value: '"hello world"', matchType: "value" }]);
    expect(result.total).toBe(1);
  });

  it("matches an object key", () => {
    const result = flattenSearch({ greeting: "hi" }, "greet");
    expect(result.matches).toEqual([{ path: ["greeting"], value: "greeting", matchType: "key" }]);
    expect(result.total).toBe(1);
  });

  it("matches both key and value when both contain query", () => {
    const result = flattenSearch({ test: "testing" }, "test");
    expect(result.total).toBe(2);
    expect(result.matches).toHaveLength(2);
    expect(result.matches[0].matchType).toBe("key");
    expect(result.matches[1].matchType).toBe("value");
  });

  it("tracks correct nested path", () => {
    const data = { a: { b: { c: "found" } } };
    const result = flattenSearch(data, "found");
    expect(result.matches[0].path).toEqual(["a", "b", "c"]);
  });

  it("tracks array indices in path", () => {
    const data = { items: ["alpha", "beta", "gamma"] };
    const result = flattenSearch(data, "beta");
    expect(result.matches[0].path).toEqual(["items", "1"]);
  });

  it("matches numbers", () => {
    const result = flattenSearch({ count: 42 }, "42");
    expect(result.matches).toEqual([{ path: ["count"], value: "42", matchType: "value" }]);
  });

  it("matches booleans", () => {
    const result = flattenSearch({ active: true }, "true");
    expect(result.matches).toEqual([{ path: ["active"], value: "true", matchType: "value" }]);
  });

  it("matches null", () => {
    const result = flattenSearch({ value: null }, "null");
    expect(result.matches).toEqual([{ path: ["value"], value: "null", matchType: "value" }]);
  });

  it("is case insensitive", () => {
    const result = flattenSearch({ Name: "Hello World" }, "hello");
    expect(result.total).toBe(1);
    expect(result.matches[0].value).toBe('"Hello World"');
  });

  it("is case insensitive for keys", () => {
    const result = flattenSearch({ MyKey: "val" }, "mykey");
    expect(result.total).toBe(1);
    expect(result.matches[0].matchType).toBe("key");
  });

  it("truncates at maxResults but reports correct total", () => {
    const data: Record<string, string> = {};
    for (let i = 0; i < 20; i++) {
      data[`item${i}`] = `match_${i}`;
    }
    const result = flattenSearch(data, "match", 5);
    expect(result.matches).toHaveLength(5);
    expect(result.total).toBe(20);
    expect(result.truncated).toBe(true);
  });

  it("does not truncate when under maxResults", () => {
    const data = { a: "match", b: "match" };
    const result = flattenSearch(data, "match", 500);
    expect(result.matches).toHaveLength(2);
    expect(result.truncated).toBe(false);
  });

  it("returns no matches when nothing matches", () => {
    const result = flattenSearch({ foo: "bar" }, "xyz");
    expect(result.matches).toEqual([]);
    expect(result.total).toBe(0);
  });

  it("handles deeply nested arrays", () => {
    const data = { root: [[["deep"]]] };
    const result = flattenSearch(data, "deep");
    expect(result.matches[0].path).toEqual(["root", "0", "0", "0"]);
  });
});
