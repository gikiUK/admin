import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { EnrichedFact } from "@/lib/blob/types";
import { FactRelationshipInfo } from "./fact-relationship-info";

type FactCardProps = {
  fact: EnrichedFact;
};

function TypeBadge({ type }: { type: string }) {
  const variant = type === "boolean_state" ? "outline" : type === "enum" ? "secondary" : "default";
  return <Badge variant={variant}>{type}</Badge>;
}

export function FactCard({ fact }: FactCardProps) {
  return (
    <Link href={`/data/facts/${fact.id}`} className="block">
      <Card className={`gap-0 py-0 transition-colors hover:border-primary/50${fact.discarded ? " opacity-50" : ""}`}>
        <CardHeader className="gap-1 px-4 py-3">
          <span className="font-mono text-sm font-semibold">{fact.id}</span>
          <div className="flex items-center gap-2">
            <TypeBadge type={fact.type} />
            <Badge variant={fact.core ? "default" : "secondary"}>{fact.core ? "Core" : "Derived"}</Badge>
          </div>
          {fact.values_ref && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <ExternalLink className="size-3" />
              {fact.values_ref}
            </span>
          )}
        </CardHeader>
        <CardContent className="border-t px-4 py-3">
          <FactRelationshipInfo relationships={fact.relationships} />
        </CardContent>
      </Card>
    </Link>
  );
}
