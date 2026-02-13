import { loadActionCounts } from "./action-counts";
import { assignCategory, getCategoryLabel, getCategoryOrder } from "./fact-categories";
import { loadFacts } from "./facts";
import { getFactById } from "./mock-api";
import { loadQuestions } from "./questions";
import { loadRules } from "./rules";
import type { EnrichedFact, FactCategory, FactRelationships, Question, Rule } from "./types";

function findSetByQuestion(factId: string, questions: Question[]): FactRelationships["setByQuestion"] {
  for (const q of questions) {
    if (q.fact === factId) return { index: q.index, label: q.label };
    if (q.facts) {
      const defaults = q.facts.defaults;
      if (defaults && factId in defaults) return { index: q.index, label: q.label };
    }
  }
  return undefined;
}

function findDerivedFrom(factId: string, rules: Rule[]): Rule | undefined {
  return rules.find((r) => r.sets === factId && r.value === true);
}

function findConstraints(factId: string, rules: Rule[]): Rule[] {
  return rules.filter((r) => r.sets === factId && (r.value === false || r.value === "not_applicable"));
}

export function loadEnrichedFacts(): FactCategory[] {
  const facts = loadFacts();
  const questions = loadQuestions();
  const rules = loadRules();
  const actionCounts = loadActionCounts();

  const enriched: EnrichedFact[] = facts.map((fact) => ({
    ...fact,
    category: assignCategory(fact.id),
    relationships: {
      setByQuestion: fact.core ? findSetByQuestion(fact.id, questions) : undefined,
      derivedFrom: !fact.core ? findDerivedFrom(fact.id, rules) : undefined,
      constrainedBy: findConstraints(fact.id, rules),
      actionCount: actionCounts[fact.id] ?? 0
    }
  }));

  const groups = new Map<string, EnrichedFact[]>();
  for (const fact of enriched) {
    const existing = groups.get(fact.category) ?? [];
    existing.push(fact);
    groups.set(fact.category, existing);
  }

  const order = getCategoryOrder();
  const categories: FactCategory[] = [];

  for (const key of order) {
    const facts = groups.get(key);
    if (facts) {
      categories.push({ key, label: getCategoryLabel(key), facts });
      groups.delete(key);
    }
  }

  // Any uncategorized facts
  for (const [key, facts] of groups) {
    categories.push({ key, label: getCategoryLabel(key), facts });
  }

  return categories;
}

export function loadEnrichedFactById(id: string): EnrichedFact | null {
  return getFactById(id);
}
