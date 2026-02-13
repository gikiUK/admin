import type { DatasetData } from "./types";

export type DiffKind = "added" | "modified" | "discarded" | "restored";

export type FieldDiff = {
  field: string;
  from: string;
  to: string;
};

export type DiffEntry = {
  kind: DiffKind;
  entity: "fact" | "question" | "rule";
  key: string;
  label: string;
  fields: FieldDiff[];
};

export type DatasetDiff = {
  entries: DiffEntry[];
  totalChanges: number;
};

function formatValue(v: unknown): string {
  if (v === undefined) return "(none)";
  if (typeof v === "string") return v;
  if (typeof v === "boolean") return v ? "true" : "false";
  return JSON.stringify(v);
}

function diffFields(a: Record<string, unknown> | undefined, b: Record<string, unknown> | undefined): FieldDiff[] {
  if (!a && !b) return [];
  const from = a ?? {};
  const to = b ?? {};
  const allKeys = new Set([...Object.keys(from), ...Object.keys(to)]);
  const diffs: FieldDiff[] = [];
  for (const key of allKeys) {
    if (JSON.stringify(from[key]) !== JSON.stringify(to[key])) {
      diffs.push({ field: key, from: formatValue(from[key]), to: formatValue(to[key]) });
    }
  }
  return diffs;
}

function compareEntity(
  entity: DiffEntry["entity"],
  key: string,
  label: string,
  orig: Record<string, unknown> | undefined,
  curr: Record<string, unknown> | undefined
): DiffEntry | null {
  if (!orig && curr) {
    return { kind: "added", entity, key, label, fields: diffFields(undefined, curr) };
  }
  if (!orig || !curr) return null;

  if (!orig.discarded && curr.discarded) {
    return { kind: "discarded", entity, key, label, fields: [] };
  }
  if (orig.discarded && !curr.discarded) {
    return { kind: "restored", entity, key, label, fields: [] };
  }

  const fields = diffFields(orig, curr);
  if (fields.length === 0) return null;
  return { kind: "modified", entity, key, label, fields };
}

export function computeDatasetDiff(original: DatasetData, current: DatasetData): DatasetDiff {
  const entries: DiffEntry[] = [];

  // Facts
  const allFactKeys = new Set([...Object.keys(original.facts), ...Object.keys(current.facts)]);
  for (const key of allFactKeys) {
    const entry = compareEntity(
      "fact",
      key,
      key,
      original.facts[key] as unknown as Record<string, unknown> | undefined,
      current.facts[key] as unknown as Record<string, unknown> | undefined
    );
    if (entry) entries.push(entry);
  }

  // Questions
  const maxQ = Math.max(original.questions.length, current.questions.length);
  for (let i = 0; i < maxQ; i++) {
    const orig = original.questions[i];
    const curr = current.questions[i];
    const label = curr?.label ?? orig?.label ?? `Question #${i + 1}`;
    const entry = compareEntity(
      "question",
      `q-${i}`,
      label,
      orig as unknown as Record<string, unknown> | undefined,
      curr as unknown as Record<string, unknown> | undefined
    );
    if (entry) entries.push(entry);
  }

  // Rules
  const maxR = Math.max(original.rules.length, current.rules.length);
  for (let i = 0; i < maxR; i++) {
    const orig = original.rules[i];
    const curr = current.rules[i];
    const label = curr?.sets ?? orig?.sets ?? `Rule #${i + 1}`;
    const entry = compareEntity(
      "rule",
      `r-${i}`,
      label,
      orig as unknown as Record<string, unknown> | undefined,
      curr as unknown as Record<string, unknown> | undefined
    );
    if (entry) entries.push(entry);
  }

  return { entries, totalChanges: entries.length };
}
