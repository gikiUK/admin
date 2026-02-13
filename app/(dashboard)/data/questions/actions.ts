"use server";

import { createQuestion, deleteQuestion, updateQuestion } from "@/lib/data/mock-api";
import type { Question } from "@/lib/data/types";

export async function createQuestionAction(question: Omit<Question, "index">): Promise<Question> {
  return createQuestion(question);
}

export async function updateQuestionAction(index: number, updates: Partial<Omit<Question, "index">>): Promise<void> {
  updateQuestion(index, updates);
}

export async function deleteQuestionAction(index: number): Promise<void> {
  deleteQuestion(index);
}
