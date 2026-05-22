"use client";

type Props = {
  x?: number;
  y?: number;
  payload?: { value: string };
  textWidth: number;
};

export function TruncatedYTick({ x = 0, y = 0, payload, textWidth }: Props) {
  const label = payload?.value ?? "";
  return (
    <g transform={`translate(${x},${y})`}>
      <foreignObject x={-textWidth} y={-10} width={textWidth} height={20}>
        <div title={label} className="truncate text-right text-xs text-muted-foreground" style={{ lineHeight: "20px" }}>
          {label}
        </div>
      </foreignObject>
    </g>
  );
}
