import type { BlobConstantValue, BlobFact } from "./types";

export type FactsLookup = Record<string, BlobFact>;
export type ConstantsLookup = Record<string, BlobConstantValue[]>;

/** Resolve a numeric constant ID to its human-readable label (or name, or raw ID as fallback). */
export function resolveConstantId(
  item: string | number,
  factKey: string,
  facts: FactsLookup,
  constants: ConstantsLookup
): string {
  if (typeof item === "string") return item;
  const fact = facts[factKey];
  const group = fact?.values_ref ? constants[fact.values_ref] : undefined;
  const entry = group?.find((c) => c.id === item);
  return entry?.label ?? entry?.name ?? String(item);
}
