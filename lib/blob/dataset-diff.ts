import type { DatasetData } from "./types";

export type DiffKind = "added" | "modified" | "disabled" | "restored";

export type DiffSegment = { text: string; type: "equal" | "removed" | "added" };

export type FieldDiff = {
  field: string;
  from: string;
  to: string;
  segments: DiffSegment[];
};

export type DiffEntry = {
  kind: DiffKind;
  entity: "fact" | "question" | "rule" | "constant";
  key: string;
  label: string;
  href: string | null;
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

// Word-level diff using longest common subsequence
export function computeSegments(from: string, to: string): DiffSegment[] {
  if (from === to) return [{ text: from, type: "equal" }];
  if (!from) return [{ text: to, type: "added" }];
  if (!to) return [{ text: from, type: "removed" }];

  const fromWords = from.split(/(\s+)/);
  const toWords = to.split(/(\s+)/);

  // LCS table
  const m = fromWords.length;
  const n = toWords.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = fromWords[i - 1] === toWords[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  // Backtrack to get segments
  const raw: DiffSegment[] = [];
  let i = m;
  let j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && fromWords[i - 1] === toWords[j - 1]) {
      raw.push({ text: fromWords[i - 1], type: "equal" });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      raw.push({ text: toWords[j - 1], type: "added" });
      j--;
    } else {
      raw.push({ text: fromWords[i - 1], type: "removed" });
      i--;
    }
  }
  raw.reverse();

  // Merge consecutive segments of same type
  const merged: DiffSegment[] = [];
  for (const seg of raw) {
    const last = merged[merged.length - 1];
    if (last && last.type === seg.type) {
      last.text += seg.text;
    } else {
      merged.push({ ...seg });
    }
  }
  return merged;
}

function diffFields(a: Record<string, unknown> | undefined, b: Record<string, unknown> | undefined): FieldDiff[] {
  if (!a && !b) return [];
  const from = a ?? {};
  const to = b ?? {};
  const allKeys = new Set([...Object.keys(from), ...Object.keys(to)]);
  const diffs: FieldDiff[] = [];
  for (const key of allKeys) {
    if (JSON.stringify(from[key]) !== JSON.stringify(to[key])) {
      const fromStr = formatValue(from[key]);
      const toStr = formatValue(to[key]);
      diffs.push({ field: key, from: fromStr, to: toStr, segments: computeSegments(fromStr, toStr) });
    }
  }
  return diffs;
}

function compareEntity(
  entity: DiffEntry["entity"],
  key: string,
  label: string,
  href: string | null,
  orig: Record<string, unknown> | undefined,
  curr: Record<string, unknown> | undefined
): DiffEntry | null {
  if (!orig && curr) {
    return { kind: "added", entity, key, label, href, fields: diffFields(undefined, curr) };
  }
  if (!orig || !curr) return null;

  if (orig.enabled !== false && curr.enabled === false) {
    return { kind: "disabled", entity, key, label, href, fields: [] };
  }
  if (orig.enabled === false && curr.enabled !== false) {
    return { kind: "restored", entity, key, label, href, fields: [] };
  }

  const fields = diffFields(orig, curr);
  if (fields.length === 0) return null;
  return { kind: "modified", entity, key, label, href, fields };
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
      `/data/facts/${key}`,
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
      `/data/questions/${i}`,
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
      null,
      orig as unknown as Record<string, unknown> | undefined,
      curr as unknown as Record<string, unknown> | undefined
    );
    if (entry) entries.push(entry);
  }

  // Constants
  const allConstantKeys = new Set([...Object.keys(original.constants), ...Object.keys(current.constants)]);
  for (const groupKey of allConstantKeys) {
    const origValues = original.constants[groupKey] ?? [];
    const currValues = current.constants[groupKey] ?? [];
    const allIds = new Set([...origValues.map((v) => v.id), ...currValues.map((v) => v.id)]);
    for (const id of allIds) {
      const orig = origValues.find((v) => v.id === id);
      const curr = currValues.find((v) => v.id === id);
      const label = `${groupKey} / ${curr?.name ?? orig?.name ?? `#${id}`}`;
      const entry = compareEntity(
        "constant",
        `const-${groupKey}-${id}`,
        label,
        null,
        orig as unknown as Record<string, unknown> | undefined,
        curr as unknown as Record<string, unknown> | undefined
      );
      if (entry) entries.push(entry);
    }
  }

  return { entries, totalChanges: entries.length };
}
