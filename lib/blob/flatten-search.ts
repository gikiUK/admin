export type SearchMatch = {
  path: string[];
  value: string;
  matchType: "key" | "value";
};

export type SearchResult = {
  matches: SearchMatch[];
  truncated: boolean;
  total: number;
};

export function flattenSearch(root: unknown, query: string, maxResults = 500): SearchResult {
  if (!query) return { matches: [], truncated: false, total: 0 };

  const lowerQuery = query.toLowerCase();
  const matches: SearchMatch[] = [];
  let total = 0;

  function walk(value: unknown, path: string[]): void {
    if (value === null) {
      if ("null".includes(lowerQuery)) {
        total++;
        if (matches.length < maxResults) {
          matches.push({ path, value: "null", matchType: "value" });
        }
      }
      return;
    }

    if (typeof value === "string") {
      if (value.toLowerCase().includes(lowerQuery)) {
        total++;
        if (matches.length < maxResults) {
          matches.push({ path, value: `"${value}"`, matchType: "value" });
        }
      }
      return;
    }

    if (typeof value === "number" || typeof value === "boolean") {
      const str = String(value);
      if (str.toLowerCase().includes(lowerQuery)) {
        total++;
        if (matches.length < maxResults) {
          matches.push({ path, value: str, matchType: "value" });
        }
      }
      return;
    }

    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        walk(value[i], [...path, String(i)]);
      }
      return;
    }

    if (typeof value === "object") {
      for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
        if (key.toLowerCase().includes(lowerQuery)) {
          total++;
          if (matches.length < maxResults) {
            matches.push({ path: [...path, key], value: key, matchType: "key" });
          }
        }
        walk(val, [...path, key]);
      }
    }
  }

  walk(root, []);

  return { matches, truncated: matches.length < total, total };
}
