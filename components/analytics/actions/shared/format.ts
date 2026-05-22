export function formatSignedPct(value: number | null): string {
  if (value === null) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${(value * 100).toFixed(1)}%`;
}

export function formatPct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}
