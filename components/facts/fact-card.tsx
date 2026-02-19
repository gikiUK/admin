"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { EnrichedFact } from "@/lib/blob/types";
import { formatFactName } from "@/lib/utils";
import { FactRelationshipInfo } from "./fact-relationship-info";

type FactCardProps = {
  fact: EnrichedFact;
};

function TypeBadge({ type }: { type: string }) {
  const variant = type === "boolean_state" ? "outline" : type === "enum" ? "secondary" : "default";
  return <Badge variant={variant}>{type}</Badge>;
}

export function FactCard({ fact }: FactCardProps) {
  const router = useRouter();
  const href = `/data/facts/${fact.id}`;

  function handleClick(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest("a")) return;
    router.push(href);
  }

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: card is supplemental click target, inner links are keyboard-accessible
    // biome-ignore lint/a11y/noStaticElementInteractions: intentional — card wraps interactive children
    <div onClick={handleClick} className="cursor-pointer">
      <Card className={`gap-0 py-0 transition-colors hover:border-primary/50${!fact.enabled ? " opacity-50" : ""}`}>
        <CardHeader className="gap-0 px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm leading-none font-semibold uppercase tracking-wide">{formatFactName(fact.id)}</span>
            <div className="flex items-center gap-1.5">
              <TypeBadge type={fact.type} />
              <Badge variant={fact.core ? "default" : "secondary"}>{fact.core ? "Core" : "Derived"}</Badge>
            </div>
          </div>
          {fact.values_ref && (
            <Link
              href={`/data/constants#${fact.values_ref}`}
              className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              <ExternalLink className="size-3" />
              {fact.values_ref}
            </Link>
          )}
        </CardHeader>
        <CardContent className="border-t px-4 py-3">
          <FactRelationshipInfo relationships={fact.relationships} />
        </CardContent>
      </Card>
    </div>
  );
}
