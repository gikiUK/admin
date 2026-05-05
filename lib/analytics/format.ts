const GBP_FORMATTER = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0
});

export function formatGbp(amountInCents: number): string {
  return GBP_FORMATTER.format(amountInCents / 100);
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(0)}%`;
}
