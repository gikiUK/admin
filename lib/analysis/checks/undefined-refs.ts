import type { AnyCondition, BlobCondition, DatasetData, SimpleCondition } from "@/lib/blob/types";
import type { AnalysisIssue, CheckResult, IssueRef } from "../types";

type ConditionEntry = { key: string; value: string | boolean | number | number[] | string[] };

function extractEntries(condition: BlobCondition): ConditionEntry[] {
  if ("any" in condition) {
    return (condition as AnyCondition).any.flatMap((sub) =>
      Object.entries(sub).map(([key, value]) => ({ key, value }))
    );
  }
  return Object.entries(condition as SimpleCondition).map(([key, value]) => ({ key, value }));
}

function resolveConstantIdentifiers(valuesRef: string, data: DatasetData): Set<string> {
  const group = data.constants[valuesRef];
  if (!group) return new Set();
  const ids = new Set<string>();
  for (const c of group) {
    if (!c.enabled) continue;
    ids.add(c.name);
    ids.add(String(c.id));
  }
  return ids;
}

function getFactValues(factId: string, data: DatasetData): Set<string> | null {
  const fact = data.facts[factId];
  if (!fact) return null;
  if (!fact.values_ref) return new Set();
  return resolveConstantIdentifiers(fact.values_ref, data);
}

/** Check if fact exists but is disabled */
function isDisabledFact(factId: string, data: DatasetData): boolean {
  const fact = data.facts[factId];
  return !!fact && !fact.enabled;
}

export function checkUndefinedRefs(data: DatasetData): CheckResult {
  const factIds = new Set(Object.keys(data.facts));
  const issues: AnalysisIssue[] = [];

  function checkCondition(condition: BlobCondition, context: string, contextRef: IssueRef) {
    for (const entry of extractEntries(condition)) {
      if (entry.key === "any_of" && Array.isArray(entry.value)) {
        for (const ref of entry.value as string[]) {
          if (!factIds.has(ref)) {
            issues.push({
              severity: "error",
              message: `${context} references undefined fact "${ref}" in any_of`,
              suggestion: `Check for typos in the fact name. No fact called "${ref}" exists in the dataset.`,
              refs: [contextRef]
            });
          }
        }
        continue;
      }

      if (!factIds.has(entry.key)) {
        const disabled = isDisabledFact(entry.key, data);
        issues.push({
          severity: "error",
          message: `${context} references undefined fact "${entry.key}"`,
          suggestion: disabled
            ? `Fact "${entry.key}" exists but is disabled. Re-enable it or update the condition.`
            : `Check for typos in the fact name. No fact called "${entry.key}" exists in the dataset.`,
          refs: [contextRef]
        });
        continue;
      }

      if (typeof entry.value === "string" && entry.value !== "not_applicable") {
        const validValues = getFactValues(entry.key, data);
        if (validValues && validValues.size > 0 && !validValues.has(entry.value)) {
          issues.push({
            severity: "error",
            message: `${context} references unknown value "${entry.value}" for fact "${entry.key}"`,
            suggestion: `This value doesn't match any constant in the "${data.facts[entry.key]?.values_ref}" group. Check for typos or add the missing constant.`,
            refs: [contextRef]
          });
        }
      }

      if (Array.isArray(entry.value)) {
        const validValues = getFactValues(entry.key, data);
        if (validValues && validValues.size > 0) {
          for (const v of entry.value) {
            const name = typeof v === "number" ? String(v) : String(v);
            if (!validValues.has(name)) {
              issues.push({
                severity: "error",
                message: `${context} references unknown value "${name}" for fact "${entry.key}"`,
                suggestion: `This value doesn't match any name or ID in the "${data.facts[entry.key]?.values_ref}" constants group. It may have been removed or renamed.`,
                refs: [contextRef]
              });
            }
          }
        }
      }
    }
  }

  for (let i = 0; i < data.questions.length; i++) {
    const q = data.questions[i];
    if (!q.enabled) continue;
    const ref: IssueRef = { type: "question", id: String(i), label: q.label };
    if (q.fact && !factIds.has(q.fact)) {
      issues.push({
        severity: "error",
        message: `Question "${q.label}" sets undefined fact "${q.fact}"`,
        suggestion: `Create the fact "${q.fact}" or update this question to point to an existing fact.`,
        refs: [ref]
      });
    }
    if (q.show_when) checkCondition(q.show_when, `Question "${q.label}" show_when`, ref);
    if (q.hide_when) checkCondition(q.hide_when, `Question "${q.label}" hide_when`, ref);
  }

  for (let i = 0; i < data.rules.length; i++) {
    const rule = data.rules[i];
    if (!rule.enabled) continue;
    const ref: IssueRef = { type: "rule", id: String(i), label: `Rule #${i} (sets ${rule.sets})` };
    if (!factIds.has(rule.sets)) {
      issues.push({
        severity: "error",
        message: `Rule #${i} sets undefined fact "${rule.sets}"`,
        suggestion: `Create the fact "${rule.sets}" or disable this rule.`,
        refs: [ref]
      });
    }
    checkCondition(rule.when, `Rule #${i}`, ref);
  }

  for (const [actionId, ac] of Object.entries(data.action_conditions)) {
    if (!ac.enabled) continue;
    const ref: IssueRef = { type: "action", id: actionId };
    checkCondition(ac.include_when, `Action ${actionId} include_when`, ref);
    checkCondition(ac.exclude_when, `Action ${actionId} exclude_when`, ref);
  }

  return {
    id: "undefined-refs",
    name: "Undefined References",
    description: "Conditions that reference non-existent facts or values",
    issues
  };
}
