import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Rule } from "./types";

const DATA_DIR = resolve(process.cwd(), "..", "facts", "data");

export function loadRules(): Rule[] {
  const general = JSON.parse(readFileSync(resolve(DATA_DIR, "general_rules.json"), "utf-8")) as { rules: Rule[] };
  const hotspot = JSON.parse(readFileSync(resolve(DATA_DIR, "hotspot_rules.json"), "utf-8")) as { rules: Rule[] };
  return [...general.rules, ...hotspot.rules];
}
