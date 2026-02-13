import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getConstant } from "./constants";
import type { FactDefinition, FactType } from "./types";

const DATA_DIR = resolve(process.cwd(), "..", "facts", "data");

type RawFact = {
  type: FactType;
  core: boolean;
  values_ref?: string;
};

export function loadFacts(): FactDefinition[] {
  const raw = readFileSync(resolve(DATA_DIR, "facts.json"), "utf-8");
  const { facts } = JSON.parse(raw) as { facts: Record<string, RawFact> };

  return Object.entries(facts).map(([id, def]) => {
    const fact: FactDefinition = {
      id,
      type: def.type,
      core: def.core
    };

    if (def.values_ref) {
      fact.valuesRef = def.values_ref;
      const resolved = getConstant(def.values_ref);
      if (Array.isArray(resolved)) {
        fact.values = resolved.map((v: string | { label: string }) => (typeof v === "string" ? v : v.label));
      }
    }

    return fact;
  });
}
