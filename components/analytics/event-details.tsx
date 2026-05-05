"use client";

import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

type EventDetailsProps = {
  details: Record<string, unknown>;
};

export function EventDetails({ details }: EventDetailsProps) {
  const isEmpty = Object.keys(details).length === 0;
  if (isEmpty) {
    return <span className="text-muted-foreground">—</span>;
  }
  return (
    <Collapsible className="group/details">
      <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ChevronDown className="size-3 transition-transform group-data-[state=open]/details:rotate-180" />
        <span>{Object.keys(details).length} keys</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <pre className="mt-2 max-w-md overflow-x-auto rounded-md bg-muted p-2 text-xs">
          {JSON.stringify(details, null, 2)}
        </pre>
      </CollapsibleContent>
    </Collapsible>
  );
}
