import type { useTags } from "@/lib/manage/use-tags";

export type TagEntry = { name: string; count: number };

type TagsState = ReturnType<typeof useTags>;

/**
 * Combine the server-known tags with already-selected ones that may not appear in the API
 * response yet (just created locally, or removed elsewhere). Sorted alphabetically.
 */
export function buildTagUniverse(state: TagsState, selected: string[]): TagEntry[] {
  const fromApi: TagEntry[] = state.status === "ready" ? state.tags : [];
  const known = new Set(fromApi.map((t) => t.name));
  const orphans: TagEntry[] = selected.filter((v) => !known.has(v)).map((name) => ({ name, count: 0 }));
  return [...fromApi, ...orphans].sort((a, b) => a.name.localeCompare(b.name));
}
