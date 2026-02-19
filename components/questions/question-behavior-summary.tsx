import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { BlobQuestion } from "@/lib/blob/types";
import { formatFactName } from "@/lib/utils";

function FactLink({ fact }: { fact: string }) {
  return (
    <Badge
      variant="secondary"
      className="text-xs font-semibold uppercase tracking-wide transition-colors hover:text-primary"
      asChild
    >
      <Link href={`/data/facts/${fact}`}>{formatFactName(fact)}</Link>
    </Badge>
  );
}

function OptionsRefLink({ optionsRef }: { optionsRef: string }) {
  return (
    <Badge variant="outline" className="font-mono text-xs transition-colors hover:text-primary" asChild>
      <Link href={`/data/constants#${optionsRef}`}>{optionsRef}</Link>
    </Badge>
  );
}

export function QuestionBehaviorSummary({ question }: { question: BlobQuestion }) {
  const q = question;

  if (q.type === "boolean_state" && q.fact) {
    return (
      <p className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        <span>Sets</span>
        <FactLink fact={q.fact} />
        <span>to true / false</span>
      </p>
    );
  }

  if (q.type === "single-select" && q.fact) {
    return (
      <p className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        <span>Sets</span>
        <FactLink fact={q.fact} />
        <span>to one of</span>
        {q.options_ref ? (
          <OptionsRefLink optionsRef={q.options_ref} />
        ) : (
          <span className="font-medium text-foreground">{q.options?.length ?? 0} options</span>
        )}
      </p>
    );
  }

  if (q.type === "multi-select" && q.fact) {
    return (
      <p className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        <span>Sets</span>
        <FactLink fact={q.fact} />
        <span>to values from</span>
        {q.options_ref ? (
          <OptionsRefLink optionsRef={q.options_ref} />
        ) : (
          <span className="font-medium text-foreground">{q.options?.length ?? 0} options</span>
        )}
      </p>
    );
  }

  if (q.type === "checkbox-radio-hybrid" && q.facts) {
    const factKeys = Object.keys(q.facts.defaults ?? {});
    return (
      <div className="space-y-1.5">
        {q.options && q.options.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 text-xs">
            <span className="text-muted-foreground">Choices:</span>
            {q.options.map((opt) => (
              <Badge key={opt.value} variant="outline" className="text-xs">
                {opt.label}
                {opt.exclusive && <span className="ml-1 text-muted-foreground">(excl.)</span>}
              </Badge>
            ))}
          </div>
        )}
        {factKeys.length > 0 && (
          <p className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            <span>Sets</span>
            {factKeys.map((fact, i) => (
              <span key={fact} className="inline-flex items-center gap-1">
                <FactLink fact={fact} />
                {i < factKeys.length - 1 && <span>,</span>}
              </span>
            ))}
          </p>
        )}
      </div>
    );
  }

  // Fallback: single fact with no recognized type combo
  if (q.fact) {
    return (
      <p className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        <span>Sets</span>
        <FactLink fact={q.fact} />
      </p>
    );
  }

  return null;
}
