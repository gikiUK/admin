export type FactsMap = Record<string, Record<string, string | boolean>>;

/** The three values the facts engine accepts in a facts mapping. */
export type TriState = boolean | "unknown";

export function normalizeTriState(value: string | boolean | undefined): TriState | undefined {
  if (value === undefined) return undefined;
  if (value === true || value === false) return value;
  return "unknown";
}
