import { ACTION_TYPES, type ActionType } from "@/lib/analytics/api";
import { type EventCategory, getEventDisplay } from "@/lib/analytics/event-display";

export type SeriesId = "all" | `cat:${EventCategory}` | `type:${ActionType}`;

export type SeriesKind = "all" | "category" | "type";

export type SeriesDef = {
  id: SeriesId;
  /** Chart-safe key (no `:`) used for dataKey and the `--color-<key>` CSS var. */
  key: string;
  kind: SeriesKind;
  label: string;
  color: string;
  matches: (actionType: string) => boolean;
};

function toKey(id: SeriesId): string {
  return id.replace(/:/g, "_");
}

const CATEGORY_ORDER: EventCategory[] = ["user", "org", "action", "invitation", "membership", "onboarding", "document"];

const CATEGORY_LABEL: Record<EventCategory, string> = {
  user: "Users",
  org: "Orgs",
  action: "Actions",
  invitation: "Invitations",
  membership: "Memberships",
  onboarding: "Onboarding",
  document: "Documents"
};

const CATEGORY_COLOR: Record<EventCategory, string> = {
  user: "oklch(0.62 0.19 264)",
  org: "oklch(0.66 0.16 162)",
  action: "oklch(0.66 0.21 41)",
  invitation: "oklch(0.7 0.18 70)",
  membership: "oklch(0.62 0.24 305)",
  onboarding: "oklch(0.65 0.22 22)",
  document: "oklch(0.64 0.13 195)"
};

const ALL_COLOR = "oklch(0.541 0.281 293.009)";

function categoryOf(actionType: string): EventCategory {
  return getEventDisplay(actionType).category;
}

function typeShade(actionType: string, category: EventCategory): string {
  const base = CATEGORY_COLOR[category];
  const peers = ACTION_TYPES.filter((t) => categoryOf(t) === category);
  const index = peers.indexOf(actionType as ActionType);
  if (index < 0) return base;
  const span = Math.max(peers.length - 1, 1);
  const offset = peers.length === 1 ? 0 : (index / span) * 0.18 - 0.09;
  const match = base.match(/oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)/);
  if (!match) return base;
  const [, lStr, cStr, hStr] = match;
  const l = Math.min(0.85, Math.max(0.4, Number(lStr) + offset));
  return `oklch(${l.toFixed(3)} ${cStr} ${hStr})`;
}

const ALL_SERIES: SeriesDef = {
  id: "all",
  key: toKey("all"),
  kind: "all",
  label: "All events",
  color: ALL_COLOR,
  matches: () => true
};

export const CATEGORY_SERIES: SeriesDef[] = CATEGORY_ORDER.map((category) => {
  const id = `cat:${category}` as const;
  return {
    id,
    key: toKey(id),
    kind: "category" as const,
    label: CATEGORY_LABEL[category],
    color: CATEGORY_COLOR[category],
    matches: (actionType: string) => categoryOf(actionType) === category
  };
});

export const TYPE_SERIES: SeriesDef[] = ACTION_TYPES.map((actionType) => {
  const display = getEventDisplay(actionType);
  const id = `type:${actionType}` as const;
  return {
    id,
    key: toKey(id),
    kind: "type" as const,
    label: display.label,
    color: typeShade(actionType, display.category),
    matches: (other: string) => other === actionType
  };
});

const SERIES_BY_ID: Map<SeriesId, SeriesDef> = new Map([
  [ALL_SERIES.id, ALL_SERIES],
  ...CATEGORY_SERIES.map((s) => [s.id, s] as const),
  ...TYPE_SERIES.map((s) => [s.id, s] as const)
]);

export function getSeries(id: SeriesId): SeriesDef | undefined {
  return SERIES_BY_ID.get(id);
}

export function isSeriesId(value: string): value is SeriesId {
  return SERIES_BY_ID.has(value as SeriesId);
}

const DEFAULT_SELECTION: SeriesId[] = ["all"];
const EMPTY_SENTINEL = "none";

/**
 * URL key absent → default selection (`["all"]`).
 * URL key === "none" → explicit empty selection.
 * URL key === "all,cat:user" → those series.
 */
export function parseSelection(raw: string | null | undefined): SeriesId[] {
  if (raw === null || raw === undefined) return DEFAULT_SELECTION;
  if (raw === EMPTY_SENTINEL) return [];
  const seen = new Set<SeriesId>();
  const out: SeriesId[] = [];
  for (const part of raw.split(",")) {
    const trimmed = part.trim();
    if (isSeriesId(trimmed) && !seen.has(trimmed)) {
      seen.add(trimmed);
      out.push(trimmed);
    }
  }
  return out;
}

export function serializeSelection(ids: SeriesId[]): string {
  return ids.length === 0 ? EMPTY_SENTINEL : ids.join(",");
}

export type ChartPoint = { date: string } & Record<string, number | string>;

type RawPoint = { date: string; by_type: Record<string, number> };

export function aggregate(raw: RawPoint[], selected: SeriesDef[]): ChartPoint[] {
  return raw.map((point) => {
    const row: ChartPoint = { date: point.date };
    for (const series of selected) {
      let total = 0;
      for (const [actionType, count] of Object.entries(point.by_type)) {
        if (series.matches(actionType)) total += count;
      }
      row[series.key] = total;
    }
    return row;
  });
}

/** Replace each point with the trailing N-day mean (over `key` columns only). */
export function smoothSeries(points: ChartPoint[], keys: string[], window = 7): ChartPoint[] {
  if (points.length === 0 || window <= 1) return points;
  return points.map((point, index) => {
    const start = Math.max(0, index - window + 1);
    const slice = points.slice(start, index + 1);
    const len = slice.length;
    const out: ChartPoint = { date: point.date };
    for (const key of keys) {
      let sum = 0;
      for (const p of slice) sum += Number(p[key] ?? 0);
      out[key] = Math.round((sum / len) * 100) / 100;
    }
    return out;
  });
}

export function previousKeyFor(key: string): string {
  return `prev_${key}`;
}

/** Merge prior-window aggregates into the current rows under `prev_<key>`, aligned by index. */
export function mergePreviousSeries(current: ChartPoint[], previous: ChartPoint[], keys: string[]): ChartPoint[] {
  return current.map((point, index) => {
    const prior = previous[index];
    const merged: ChartPoint = { ...point };
    for (const key of keys) {
      merged[previousKeyFor(key)] = prior ? Number(prior[key] ?? 0) : 0;
    }
    return merged;
  });
}

export function totalsFor(raw: RawPoint[], selected: SeriesDef[]): Record<SeriesId, number> {
  const out = {} as Record<SeriesId, number>;
  for (const series of selected) {
    let total = 0;
    for (const point of raw) {
      for (const [actionType, count] of Object.entries(point.by_type)) {
        if (series.matches(actionType)) total += count;
      }
    }
    out[series.id] = total;
  }
  return out;
}

/**
 * Count of events covered by the *union* of selected series — each event is
 * counted once even if multiple selected series match it (e.g. All + Users).
 */
export function unionTotal(raw: RawPoint[], selected: SeriesDef[]): number {
  if (selected.length === 0) return 0;
  let total = 0;
  for (const point of raw) {
    for (const [actionType, count] of Object.entries(point.by_type)) {
      if (selected.some((series) => series.matches(actionType))) total += count;
    }
  }
  return total;
}

export const ALL_SERIES_DEF = ALL_SERIES;

const SERIES_BY_KEY: Map<string, SeriesDef> = new Map([
  [ALL_SERIES.key, ALL_SERIES],
  ...CATEGORY_SERIES.map((s) => [s.key, s] as const),
  ...TYPE_SERIES.map((s) => [s.key, s] as const)
]);

export function getSeriesByKey(key: string): SeriesDef | undefined {
  return SERIES_BY_KEY.get(key);
}

/** Action-type labels covered by a series, for tooltips. */
export function coveredEventLabels(series: SeriesDef): string[] {
  if (series.kind === "type") return [series.label];
  return ACTION_TYPES.filter((actionType) => series.matches(actionType)).map(
    (actionType) => getEventDisplay(actionType).label
  );
}
