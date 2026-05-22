import type { Dataset } from "@gikiuk/facts-engine";
import { makeFactFormatter } from "@/lib/analytics/fact-formatter";
import type { FactBreakdownValue } from "@/lib/analytics/insights/insights-api";

export type FactBreakdownContext = {
  title: string;
  labelFor: (v: FactBreakdownValue["value"]) => string;
  clickable: boolean;
};

/**
 * Derive the human title, value formatter, and whether the chart can drive filters.
 * `breakdown.key` matches `question.key` in the insights API; we pass the question's fact key
 * to the formatter so constant IDs resolve to their labels.
 */
export function buildFactBreakdownContext(dataset: Dataset | null, factKey: string): FactBreakdownContext {
  if (!dataset) {
    return {
      title: factKey,
      labelFor: (v) => (v === null ? "(unanswered)" : String(v)),
      clickable: false
    };
  }
  const question = dataset.data.questions.find((q) => q.key === factKey);
  const lookupKey = question?.fact ?? factKey;
  const formatter = makeFactFormatter(dataset.data);
  return {
    title: question?.label ?? formatter(lookupKey, null).label,
    labelFor: (v) => {
      if (v === null) return "(unanswered)";
      return formatter(lookupKey, v).valueLabel;
    },
    clickable: !!question
  };
}
