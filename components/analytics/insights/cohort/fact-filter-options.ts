import type { Dataset } from "@gikiuk/facts-engine";

export type OptionPair = { value: string | number | boolean; label: string };

export function buildFactFilterOptions(dataset: Dataset | null, factKey: string): OptionPair[] {
  if (!dataset) return [];
  const question = dataset.data.questions.find((q) => q.key === factKey);
  if (!question) return [];

  if (question.options?.length) {
    return question.options.map((o) => ({ value: o.value, label: o.label }));
  }

  // boolean_state questions have no options/options_ref — synthesize Yes/No so the filter is usable.
  // Backend (filter.rb) JSON-encodes values with to_json, so we must push real booleans —
  // a string "true" would become '"true"'::jsonb and miss raw boolean answers.
  if (question.type === "boolean_state") {
    return [
      { value: true, label: "Yes" },
      { value: false, label: "No" }
    ];
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
