"use client";

type Props = {
  counts: number[];
  color: string;
  width?: number;
  height?: number;
};

export function Sparkline({ counts, color, width = 80, height = 24 }: Props) {
  if (counts.length === 0) return null;
  const max = Math.max(...counts, 1);
  const stepX = counts.length > 1 ? width / (counts.length - 1) : width;
  const points = counts
    .map((value, i) => {
      const x = i * stepX;
      const y = height - (value / max) * (height - 2) - 1;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  const last = counts[counts.length - 1];
  const lastX = (counts.length - 1) * stepX;
  const lastY = height - (last / max) * (height - 2) - 1;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Weekly adoption sparkline"
    >
      <title>Weekly adoption sparkline</title>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={lastX} cy={lastY} r={2} fill={color} />
    </svg>
  );
}
