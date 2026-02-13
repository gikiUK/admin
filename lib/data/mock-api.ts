import { loadActionCounts } from "./action-counts";
import { assignCategory } from "./fact-categories";
import { loadFacts } from "./facts";
import { loadQuestions } from "./questions";
import { loadRules } from "./rules";
import type { EnrichedFact, FactDefinition, FactRelationships, Question, Rule } from "./types";

// ──────────────────────────────────────────────────────────
// In-memory store, seeded from JSON files on first server access.
// Mutations update memory only — no file writes.
// ──────────────────────────────────────────────────────────

type Store = {
  facts: FactDefinition[];
  rules: Rule[];
  questions: Question[];
  actionCounts: Record<string, number>;
};

let store: Store | null = null;

function getStore(): Store {
  if (!store) {
    store = {
      facts: loadFacts(),
      rules: loadRules(),
      questions: loadQuestions(),
      actionCounts: loadActionCounts()
    };
  }
  return store;
}

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

function enrichFact(fact: FactDefinition): EnrichedFact {
  const { rules, questions, actionCounts } = getStore();

  return {
    ...fact,
    category: assignCategory(fact.id),
    relationships: {
      setByQuestion: fact.core ? findSetByQuestion(fact.id, questions) : undefined,
      derivedFrom: !fact.core ? rules.find((r) => r.sets === fact.id && r.value === true) : undefined,
      constrainedBy: rules.filter((r) => r.sets === fact.id && (r.value === false || r.value === "not_applicable")),
      actionCount: actionCounts[fact.id] ?? 0
    }
  };
}

// ── Fact CRUD ────────────────────────────────────────────

export function getAllFacts(): EnrichedFact[] {
  return getStore().facts.map(enrichFact);
}

export function getFactById(id: string): EnrichedFact | null {
  const fact = getStore().facts.find((f) => f.id === id);
  return fact ? enrichFact(fact) : null;
}

export function createFact(fact: {
  id: string;
  type: FactDefinition["type"];
  core: boolean;
  valuesRef?: string;
}): void {
  getStore().facts.push({
    id: fact.id,
    type: fact.type,
    core: fact.core,
    valuesRef: fact.valuesRef
  });
}

export function updateFact(id: string, updates: Partial<Omit<FactDefinition, "id">>): void {
  const s = getStore();
  const idx = s.facts.findIndex((f) => f.id === id);
  if (idx === -1) return;
  s.facts[idx] = { ...s.facts[idx], ...updates };
}

export function deleteFact(id: string): void {
  const s = getStore();
  s.facts = s.facts.filter((f) => f.id !== id);
  s.rules = s.rules.filter((r) => r.sets !== id);
}

// ── Rule CRUD ────────────────────────────────────────────

export function getRulesForFact(factId: string): Rule[] {
  return getStore().rules.filter((r) => r.sets === factId);
}

export function addRule(rule: Rule): void {
  getStore().rules.push(rule);
}

export function updateRule(factId: string, ruleIndex: number, rule: Rule): void {
  const s = getStore();
  const factRules = s.rules.filter((r) => r.sets === factId);
  if (ruleIndex < 0 || ruleIndex >= factRules.length) return;
  const globalIdx = s.rules.indexOf(factRules[ruleIndex]);
  if (globalIdx !== -1) s.rules[globalIdx] = rule;
}

export function deleteRule(factId: string, ruleIndex: number): void {
  const s = getStore();
  const factRules = s.rules.filter((r) => r.sets === factId);
  if (ruleIndex < 0 || ruleIndex >= factRules.length) return;
  const globalIdx = s.rules.indexOf(factRules[ruleIndex]);
  if (globalIdx !== -1) s.rules.splice(globalIdx, 1);
}

// ── Questions ────────────────────────────────────────────

export function getQuestionForFact(factId: string): Question | null {
  return (
    getStore().questions.find((q) => {
      if (q.fact === factId) return true;
      if (q.facts) {
        const defaults = q.facts.defaults;
        if (defaults && factId in defaults) return true;
      }
      return false;
    }) ?? null
  );
}

export function getAllQuestions(): Question[] {
  return getStore().questions;
}

export function getQuestionByIndex(index: number): Question | null {
  return getStore().questions.find((q) => q.index === index) ?? null;
}

export function createQuestion(question: Omit<Question, "index">): Question {
  const s = getStore();
  const maxIndex = s.questions.reduce((max, q) => Math.max(max, q.index), -1);
  const newQuestion: Question = { ...question, index: maxIndex + 1 };
  s.questions.push(newQuestion);
  return newQuestion;
}

export function updateQuestion(index: number, updates: Partial<Omit<Question, "index">>): void {
  const s = getStore();
  const idx = s.questions.findIndex((q) => q.index === index);
  if (idx === -1) return;
  s.questions[idx] = { ...s.questions[idx], ...updates };
}

export function deleteQuestion(index: number): void {
  const s = getStore();
  s.questions = s.questions.filter((q) => q.index !== index);
}
