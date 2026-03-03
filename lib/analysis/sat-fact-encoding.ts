import type { Solver } from "logic-solver";
import Logic from "logic-solver";
import type { BlobConstantValue, BlobFact } from "@/lib/blob/types";
import { factVar } from "./sat-condition-encoding";

export function resolveConstantNames(valuesRef: string, constants: Record<string, BlobConstantValue[]>): string[] {
  const group = constants[valuesRef];
  if (!group) return [];
  return group.filter((c) => c.enabled).map((c) => c.name);
}

export function encodeFact(
  id: string,
  fact: BlobFact,
  constants: Record<string, BlobConstantValue[]>,
  solver: Solver,
  vars: Set<string>
) {
  const trueVar = factVar(id, "true");
  const naVar = factVar(id, "na");
  vars.add(trueVar);
  vars.add(naVar);

  if (fact.type === "boolean_state") {
    solver.require(Logic.atMostOne(trueVar, naVar));
  } else if (fact.type === "enum") {
    const names = fact.values_ref ? resolveConstantNames(fact.values_ref, constants) : [];
    const valVars = names.map((name) => {
      const v = factVar(id, `val:${name}`);
      vars.add(v);
      return v;
    });
    solver.require(Logic.atMostOne(...valVars, naVar));
  } else if (fact.type === "array") {
    const names = fact.values_ref ? resolveConstantNames(fact.values_ref, constants) : [];
    for (const name of names) {
      const v = factVar(id, `val:${name}`);
      vars.add(v);
    }
    const valVars = names.map((name) => factVar(id, `val:${name}`));
    if (valVars.length > 0) {
      solver.require(Logic.implies(naVar, Logic.not(Logic.or(...valVars))));
    }
  }
}
