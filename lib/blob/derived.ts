import { assignCategory, getCategoryLabel, getCategoryOrder } from "@/lib/data/fact-categories";
import type {
  AnyCondition,
  BlobCondition,
  BlobQuestion,
  DatasetData,
  EnrichedFact,
  FactCategory,
  FactQuestionSource,
  SimpleCondition
} from "./types";

// ── Question thread types ────────────────────────────────

export type ThreadNode = {
  question: BlobQuestion & { index: number };
  children: ThreadNode[];
  parentFact?: string;
  conditionallyHidden: boolean;
};

// ── Enriched facts ───────────────────────────────────────

function findSetByQuestion(factId: string, questions: BlobQuestion[]): FactQuestionSource | undefined {
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (q.fact === factId) {
      return { index: i, label: q.label, type: q.type };
    }
    if (q.facts) {
      const defaults = q.facts.defaults;
      if (defaults && factId in defaults) {
        const mappings = Object.entries(q.facts)
          .filter(([key]) => key !== "defaults")
          .filter(([, mapping]) => factId in mapping)
          .map(([option, mapping]) => ({ option, value: mapping[factId] }));
        return { index: i, label: q.label, type: q.type, defaultValue: defaults[factId], mappings };
      }
    }
  }
  return undefined;
}

function countActionRefs(data: DatasetData): Record<string, number> {
  const counts: Record<string, number> = {};
  function countCondition(condition: BlobCondition) {
    if ("any" in condition) {
      for (const c of (condition as AnyCondition).any) countCondition(c);
      return;
    }
    for (const [key, value] of Object.entries(condition as SimpleCondition)) {
      if (key === "any") continue;
      if (typeof value === "boolean" || typeof value === "string" || Array.isArray(value)) {
        counts[key] = (counts[key] ?? 0) + 1;
      }
    }
  }
  for (const ac of Object.values(data.action_conditions)) {
    if (!ac.enabled) continue;
    countCondition(ac.include_when);
    countCondition(ac.exclude_when);
  }
  return counts;
}

export function computeEnrichedFacts(data: DatasetData): FactCategory[] {
  const actionCounts = countActionRefs(data);

  const enriched: EnrichedFact[] = Object.entries(data.facts).map(([id, fact]) => ({
    id,
    type: fact.type,
    core: fact.core,
    category: fact.category ?? assignCategory(id),
    values_ref: fact.values_ref,
    enabled: fact.enabled,
    relationships: {
      setByQuestion: fact.core ? findSetByQuestion(id, data.questions) : undefined,
      derivedFrom: !fact.core ? data.rules.find((r) => r.sets === id && r.value === true && r.enabled) : undefined,
      constrainedBy: data.rules.filter(
        (r) => r.sets === id && (r.value === false || r.value === "not_applicable") && r.enabled
      ),
      actionCount: actionCounts[id] ?? 0
    }
  }));

  const groups = new Map<string, EnrichedFact[]>();
  for (const fact of enriched) {
    const list = groups.get(fact.category) ?? [];
    list.push(fact);
    groups.set(fact.category, list);
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

  for (const [key, facts] of groups) {
    categories.push({ key, label: getCategoryLabel(key), facts });
  }

  return categories;
}

// ── Question thread ──────────────────────────────────────

function extractFacts(condition: BlobCondition): string[] {
  if ("any" in condition) {
    return (condition as AnyCondition).any.flatMap((c) => Object.keys(c));
  }
  return Object.keys(condition as SimpleCondition);
}

export function computeQuestionThread(questions: BlobQuestion[]): ThreadNode[] {
  const factToIndex = new Map<string, number>();
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (q.fact) factToIndex.set(q.fact, i);
    if (q.facts?.defaults) {
      for (const factId of Object.keys(q.facts.defaults)) {
        factToIndex.set(factId, i);
      }
    }
  }

  const nodes: ThreadNode[] = questions.map((q, i) => ({
    question: { ...q, index: i },
    children: [],
    conditionallyHidden: false
  }));

  const childIndices = new Set<number>();

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const q = questions[i];

    if (q.show_when) {
      const refs = extractFacts(q.show_when);
      let bestParent: number | undefined;
      let bestFact: string | undefined;

      for (const fact of refs) {
        const parentIdx = factToIndex.get(fact);
        if (parentIdx !== undefined && parentIdx < i) {
          if (bestParent === undefined || parentIdx > bestParent) {
            bestParent = parentIdx;
            bestFact = fact;
          }
        }
      }

      if (bestParent !== undefined) {
        node.parentFact = bestFact;
        nodes[bestParent].children.push(node);
        childIndices.add(i);
      }
    }

    if (!q.show_when && q.hide_when) {
      node.conditionallyHidden = true;
    }
  }

  return nodes.filter((_, i) => !childIndices.has(i));
}
