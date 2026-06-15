export function formatShortDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, { dateStyle: "medium" });
}

export function formatShortDateTime(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function formatUses(usesCount: number, maxUses: number | null): string {
  if (maxUses === null) return String(usesCount);
  return `${usesCount} / ${maxUses}`;
}
