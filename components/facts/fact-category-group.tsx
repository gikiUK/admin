"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { EnrichedFact } from "@/lib/blob/types";
import { FactCard } from "./fact-card";

type FactCategoryGroupProps = {
  label: string;
  facts: EnrichedFact[];
};

export function FactCategoryGroup({ label, facts }: FactCategoryGroupProps) {
  const [open, setOpen] = useState(true);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-accent">
        {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        <span className="text-lg font-semibold">{label}</span>
        <Badge variant="secondary">{facts.length}</Badge>
      </CollapsibleTrigger>
      <CollapsibleContent className="@container">
        <div className="grid gap-3 py-3 @md:grid-cols-2 @4xl:grid-cols-3">
          {facts.map((fact) => (
            <FactCard key={fact.id} fact={fact} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
