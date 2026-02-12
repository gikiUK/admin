"use server";

import * as api from "@/lib/api/constants";
import type { ConstantGroup, ConstantValue } from "@/lib/data/types";

export async function addGroupAction(name: string, valueType: "string" | "label-value"): Promise<ConstantGroup> {
  return api.addGroup(name, valueType);
}

export async function deleteGroupAction(name: string): Promise<void> {
  return api.deleteGroup(name);
}

export async function addValueAction(groupName: string, value: ConstantValue): Promise<void> {
  return api.addValue(groupName, value);
}

export async function updateValueAction(groupName: string, index: number, value: ConstantValue): Promise<void> {
  return api.updateValue(groupName, index, value);
}

export async function deleteValueAction(groupName: string, index: number): Promise<void> {
  return api.deleteValue(groupName, index);
}
