import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

/** Buffer — single pass-through */
export function GateSingle(props: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 6 L3 18 L16 12 Z" />
      <line x1="16" y1="12" x2="21" y2="12" />
    </svg>
  );
}

/** AND — flat left, curved right */
export function GateAnd(props: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 4 L10 4 A8 8 0 0 1 10 20 L3 20 Z" />
      <line x1="18" y1="12" x2="21" y2="12" />
    </svg>
  );
}

/** OR — curved left, pointed right */
export function GateOr(props: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 4 Q8 4 11 8 Q14 12 18 12 Q14 12 11 16 Q8 20 3 20 Q7 12 3 4 Z" />
      <line x1="18" y1="12" x2="21" y2="12" />
    </svg>
  );
}
