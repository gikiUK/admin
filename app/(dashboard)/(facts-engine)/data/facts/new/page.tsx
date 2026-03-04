"use client";

import { FactEditor } from "@/components/facts/fact-editor";
import { useDataset } from "@/lib/blob/use-dataset";

export default function NewFactPage() {
  const { blob } = useDataset();

  if (!blob) return null;

  return <FactEditor isNew />;
}
