const MIN_RATE_FOR_FULL_GREEN = 0.5;

export function completionColor(rate: number): string {
  const clamped = Math.max(0, Math.min(rate, MIN_RATE_FOR_FULL_GREEN)) / MIN_RATE_FOR_FULL_GREEN;
  const hue = Math.round(clamped * 130);
  return `hsl(${hue}, 65%, 45%)`;
}

export const COMPLETION_COLOR_MAX_RATE = MIN_RATE_FOR_FULL_GREEN;
