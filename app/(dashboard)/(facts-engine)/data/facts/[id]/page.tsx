"use client";

import { useParams } from "next/navigation";
import { FactEditor } from "@/components/facts/fact-editor";
import { useDataset } from "@/lib/blob/use-dataset";

export default function FactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { blob } = useDataset();

  if (!blob) return null;
  if (!blob.facts[id]) return <div className="p-6 text-muted-foreground">Fact not found.</div>;

  return <FactEditor factId={id} />;
}
