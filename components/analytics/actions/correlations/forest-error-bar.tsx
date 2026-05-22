"use client";

type Props = {
  y: number;
  xLower: number;
  xUpper: number;
  color: string;
};

export function ForestErrorBar({ y, xLower, xUpper, color }: Props) {
  return (
    <>
      <line x1={xLower} x2={xUpper} y1={y} y2={y} stroke={color} strokeOpacity={0.5} strokeWidth={2} />
      <line x1={xLower} x2={xLower} y1={y - 4} y2={y + 4} stroke={color} strokeOpacity={0.5} strokeWidth={2} />
      <line x1={xUpper} x2={xUpper} y1={y - 4} y2={y + 4} stroke={color} strokeOpacity={0.5} strokeWidth={2} />
    </>
  );
}
