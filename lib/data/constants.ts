import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const DATA_DIR = resolve(process.cwd(), "..", "facts", "data");

let cache: Record<string, unknown> | null = null;

function readConstants(): Record<string, unknown> {
  if (cache) return cache;
  const raw = readFileSync(resolve(DATA_DIR, "constants.json"), "utf-8");
  cache = JSON.parse(raw) as Record<string, unknown>;
  return cache;
}

export function getConstant<T = string[]>(key: string): T {
  const constants = readConstants();
  return constants[key] as T;
}
