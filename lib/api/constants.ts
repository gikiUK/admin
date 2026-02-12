import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { ConstantGroup, ConstantValue } from "@/lib/data/types";

const DATA_DIR = resolve(process.cwd(), "..", "facts", "data");

let store: ConstantGroup[] | null = null;

function loadFromDisk(): ConstantGroup[] {
  const raw = readFileSync(resolve(DATA_DIR, "constants.json"), "utf-8");
  const data = JSON.parse(raw) as Record<string, ConstantValue[]>;
  return Object.entries(data).map(([name, values]) => ({ name, values }));
}

function getStore(): ConstantGroup[] {
  if (!store) {
    store = loadFromDisk();
  }
  return store;
}

export async function getAllGroups(): Promise<ConstantGroup[]> {
  return structuredClone(getStore());
}

export async function addGroup(name: string, _valueType: "string" | "label-value"): Promise<ConstantGroup> {
  const groups = getStore();
  if (groups.some((g) => g.name === name)) {
    throw new Error(`Group "${name}" already exists`);
  }
  const group: ConstantGroup = { name, values: [] };
  groups.push(group);
  return structuredClone(group);
}

export async function deleteGroup(name: string): Promise<void> {
  const groups = getStore();
  const index = groups.findIndex((g) => g.name === name);
  if (index === -1) throw new Error(`Group "${name}" not found`);
  groups.splice(index, 1);
}

export async function addValue(groupName: string, value: ConstantValue): Promise<void> {
  const groups = getStore();
  const group = groups.find((g) => g.name === groupName);
  if (!group) throw new Error(`Group "${groupName}" not found`);
  group.values.push(value);
}

export async function updateValue(groupName: string, index: number, value: ConstantValue): Promise<void> {
  const groups = getStore();
  const group = groups.find((g) => g.name === groupName);
  if (!group) throw new Error(`Group "${groupName}" not found`);
  if (index < 0 || index >= group.values.length) throw new Error("Index out of bounds");
  group.values[index] = value;
}

export async function deleteValue(groupName: string, index: number): Promise<void> {
  const groups = getStore();
  const group = groups.find((g) => g.name === groupName);
  if (!group) throw new Error(`Group "${groupName}" not found`);
  if (index < 0 || index >= group.values.length) throw new Error("Index out of bounds");
  group.values.splice(index, 1);
}
