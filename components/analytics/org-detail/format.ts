export function formatDateTime(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function formatRawFactValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) return value.length === 0 ? "[]" : value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
