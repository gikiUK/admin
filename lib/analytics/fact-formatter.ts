import type { BlobOption, BlobQuestion, DatasetData } from "@gikiuk/facts-engine";
import { resolveConstantId } from "@/lib/blob/resolve";

export type FactDisplay = {
  key: string;
  label: string;
  category: string;
  valueLabel: string;
  rawValue: unknown;
};

export type FactFormatter = (key: string, value: unknown) => FactDisplay;

const FALLBACK_CATEGORY = "Other";

function humanise(token: string): string {
  return token
    .replace(/^org\./, "")
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildQuestionIndex(questions: BlobQuestion[]): Map<string, BlobQuestion> {
  const map = new Map<string, BlobQuestion>();
  for (const q of questions) {
    if (q.fact) map.set(q.fact, q);
    if (q.facts) {
      for (const factKey of Object.keys(q.facts)) {
        if (!map.has(factKey)) map.set(factKey, q);
      }
    }
  }
  return map;
}

function resolveOptions(question: BlobQuestion | undefined, data: DatasetData): BlobOption[] | undefined {
  if (!question) return undefined;
  if (question.options) return question.options;
  if (question.options_ref) {
    const group = data.constants[question.options_ref];
    if (group) {
      return group.map((c) => ({ label: c.label ?? c.name, value: c.name }));
    }
  }
  return undefined;
}

function formatScalar(value: unknown, factKey: string, options: BlobOption[] | undefined, data: DatasetData): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") {
    return resolveConstantId(value, factKey, data.facts, data.constants);
  }
  if (typeof value === "string") {
    const match = options?.find((o) => o.value === value);
    return match?.label ?? humanise(value);
  }
  return String(value);
}

export function makeFactFormatter(data: DatasetData): FactFormatter {
  const questionIndex = buildQuestionIndex(data.questions);

  return (key, value) => {
    const fact = data.facts[key];
    const question = questionIndex.get(key);
    const options = resolveOptions(question, data);

    const label = question?.label ?? humanise(key);
    const category = fact?.category ? humanise(fact.category) : FALLBACK_CATEGORY;

    let valueLabel: string;
    if (Array.isArray(value)) {
      valueLabel = value.length === 0 ? "—" : value.map((v) => formatScalar(v, key, options, data)).join(", ");
    } else if (value !== null && typeof value === "object") {
      valueLabel = JSON.stringify(value);
    } else {
      valueLabel = formatScalar(value, key, options, data);
    }

    return { key, label, category, valueLabel, rawValue: value };
  };
}
