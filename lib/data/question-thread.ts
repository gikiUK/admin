import type { AnyCondition, Condition, Question, SimpleCondition } from "./types";

export type ThreadNode = {
  question: Question;
  children: ThreadNode[];
  parentFact?: string;
  conditionallyHidden: boolean;
};

function extractFactsFromCondition(condition: Condition): string[] {
  if ("any" in condition) {
    return (condition as AnyCondition).any.flatMap((c) => Object.keys(c));
  }
  return Object.keys(condition as SimpleCondition);
}

export function buildQuestionThread(questions: Question[]): ThreadNode[] {
  // Map: factId → question index that sets it (via defaults keys for hybrid questions)
  const factToQuestionIndex = new Map<string, number>();
  for (const q of questions) {
    if (q.fact) {
      factToQuestionIndex.set(q.fact, q.index);
    }
    if (q.facts?.defaults) {
      for (const factId of Object.keys(q.facts.defaults)) {
        factToQuestionIndex.set(factId, q.index);
      }
    }
  }

  const nodes: ThreadNode[] = questions.map((q) => ({
    question: q,
    children: [],
    conditionallyHidden: false
  }));

  const childIndices = new Set<number>();

  for (const node of nodes) {
    const q = node.question;

    if (q.showWhen) {
      const referencedFacts = extractFactsFromCondition(q.showWhen);
      // Find closest preceding question that sets one of these facts
      let bestParentIndex: number | undefined;
      let bestFact: string | undefined;

      for (const fact of referencedFacts) {
        const parentIdx = factToQuestionIndex.get(fact);
        if (parentIdx !== undefined && parentIdx < q.index) {
          if (bestParentIndex === undefined || parentIdx > bestParentIndex) {
            bestParentIndex = parentIdx;
            bestFact = fact;
          }
        }
      }

      if (bestParentIndex !== undefined) {
        node.parentFact = bestFact;
        nodes[bestParentIndex].children.push(node);
        childIndices.add(q.index);
      }
    }

    if (!q.showWhen && q.hideWhen) {
      node.conditionallyHidden = true;
    }
  }

  return nodes.filter((n) => !childIndices.has(n.question.index));
}
