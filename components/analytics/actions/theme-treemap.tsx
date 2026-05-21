"use client";

import { useMemo } from "react";
import { ResponsiveContainer, Tooltip, Treemap } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActionLeaderboardRow } from "@/lib/analytics/actions-api";

type Props = {
  rows: ActionLeaderboardRow[];
};

type TileDatum = {
  name: string;
  action_id: number;
  theme: string;
  size: number;
  completion_rate: number;
  adoption_count: number;
  completion_count: number;
};

const UNTHEMED_LABEL = "(no theme)";

function completionColor(rate: number): string {
  const clamped = Math.max(0, Math.min(1, rate / 0.5));
  const hue = Math.round(clamped * 130); // 0 red → 130 green
  return `hsl(${hue}, 60%, 45%)`;
}

export function ThemeTreemap({ rows }: Props) {
  const tiles = useMemo<TileDatum[]>(() => {
    const baseTiles = rows
      .filter((r) => r.adoption_count > 0)
      .map((r) => ({
        name: r.title ?? `#${r.action_id}`,
        action_id: r.action_id,
        theme: r.theme ?? UNTHEMED_LABEL,
        size: r.adoption_count,
        completion_rate: r.completion_rate,
        adoption_count: r.adoption_count,
        completion_count: r.completion_count
      }));

    const seen = new Map<string, number>();
    return baseTiles
      .map((tile) => {
        const count = seen.get(tile.name) ?? 0;
        seen.set(tile.name, count + 1);
        return count === 0 ? tile : { ...tile, name: `${tile.name} (#${tile.action_id})` };
      })
      .sort((a, b) => {
        if (a.theme === b.theme) return b.size - a.size;
        return a.theme.localeCompare(b.theme);
      });
  }, [rows]);

  if (tiles.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Adoption by theme</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">No actions adopted in this range.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Adoption by theme</CardTitle>
        <p className="text-xs text-muted-foreground">
          Tile size = adoption count. Tile color = completion rate (red 0% → green 50%+).
        </p>
      </CardHeader>
      <CardContent>
        <div style={{ width: "100%", height: 360 }}>
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={tiles}
              dataKey="size"
              stroke="var(--background)"
              content={<TreemapTile />}
              isAnimationActive={false}
            >
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const tile = payload[0].payload as TileDatum;
                  return (
                    <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
                      <div className="font-medium">{tile.name}</div>
                      <div className="text-muted-foreground">{tile.theme}</div>
                      <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 text-muted-foreground">
                        <span>Adoption</span>
                        <span className="text-right text-foreground">{tile.adoption_count}</span>
                        <span>Completed</span>
                        <span className="text-right text-foreground">{tile.completion_count}</span>
                        <span>Completion</span>
                        <span className="text-right text-foreground">{(tile.completion_rate * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                }}
              />
            </Treemap>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// In Recharts 3, custom Treemap content receives a TreemapNode whose data fields
// (size/completion_rate/adoption_count/etc.) are spread onto the node itself —
// not nested under `payload` as in v2.
type TileProps = Partial<TileDatum> & {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  depth?: number;
};

function TreemapTile(props: TileProps) {
  const { x = 0, y = 0, width = 0, height = 0, depth, name, completion_rate, adoption_count } = props;
  if (width <= 0 || height <= 0 || depth === 0) return null;
  if (completion_rate === undefined || adoption_count === undefined) return null;

  const showLabel = width > 70 && height > 32;
  const fill = completionColor(completion_rate);

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} fillOpacity={0.85} />
      {showLabel && (
        <>
          <text x={x + 6} y={y + 14} fontSize={11} fill="white" fontWeight={500}>
            {truncate(name ?? "", Math.floor(width / 7))}
          </text>
          <text x={x + 6} y={y + 28} fontSize={10} fill="white" fillOpacity={0.85}>
            {adoption_count} · {(completion_rate * 100).toFixed(0)}%
          </text>
        </>
      )}
    </g>
  );
}

function truncate(label: string, maxChars: number) {
  if (label.length <= maxChars) return label;
  return `${label.slice(0, Math.max(1, maxChars - 1))}…`;
}
