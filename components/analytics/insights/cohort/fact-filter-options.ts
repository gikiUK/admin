import type { Dataset } from "@gikiuk/facts-engine";

export type OptionPair = { value: string | number; label: string };

export function buildFactFilterOptions(dataset: Dataset | null, factKey: string): OptionPair[] {
  if (!dataset) return [];
  const question = dataset.data.questions.find((q) => q.key === factKey);
  if (!question) return [];

  if (question.options?.length) {
    return question.options.map((o) => ({ value: o.value, label: o.label }));
  }

  // Constant-backed facts store the numeric id in answers, so use id (not name) as the filter value.
  const valuesRef = question.fact ? dataset.data.facts[question.fact]?.values_ref : undefined;
  const ref = valuesRef ?? question.options_ref;
  if (ref && dataset.data.constants[ref]) {
    return dataset.data.constants[ref].filter((c) => c.enabled).map((c) => ({ value: c.id, label: c.label ?? c.name }));
  }
  return [];
}

export function findFactFilterQuestion(dataset: Dataset | null, factKey: string) {
  if (!dataset) return null;
  return dataset.data.questions.find((q) => q.key === factKey) ?? null;
}
