import { Badge } from "@/components/ui/badge";
import type { ConstantsLookup, FactsLookup } from "@/lib/blob/resolve";
import { resolveConstantId } from "@/lib/blob/resolve";
import { formatFactName } from "@/lib/utils";

// A condition value is a scalar, an array of them, or an operator object
// (`{ includes }`, `{ includes_any }`, `{ in }`, `{ equals }`).
export type ConditionValue = string | boolean | number | (string | number)[] | Record<string, unknown>;

// Operators whose payload is a list of scalars we can render as badges.
const LIST_OPERATORS: Record<string, string> = {
  in: "is one of",
  includes_any: "includes any of",
  contains: "contains"
};

function formatScalar(v: unknown): string {
  if (typeof v === "boolean") return v ? "true" : "false";
  if (v !== null && typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function isScalar(v: unknown): v is string | number | boolean {
  const t = typeof v;
  return t === "string" || t === "number" || t === "boolean";
}

function resolveItem(item: unknown, factKey: string, facts: FactsLookup, constants: ConstantsLookup): string {
  if (isScalar(item)) return resolveConstantId(item as string | number, factKey, facts, constants);
  return formatScalar(item);
}

function FactLabel({ factKey }: { factKey: string }) {
  return (
    <span className="rounded bg-primary/10 px-1 py-0.5 text-xs font-semibold uppercase tracking-wide text-primary">
      {formatFactName(factKey)}
    </span>
  );
}

function BadgeList({
  items,
  factKey,
  facts,
  constants
}: {
  items: unknown[];
  factKey: string;
  facts: FactsLookup;
  constants: ConstantsLookup;
}) {
  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {items.map((item, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: list items can be duplicate scalars, so position is the only stable key
        <Badge key={i} variant="secondary" className="font-normal">
          {resolveItem(item, factKey, facts, constants)}
        </Badge>
      ))}
    </div>
  );
}

export function ConditionEntry({
  factKey,
  value,
  facts,
  constants
}: {
  factKey: string;
  value: ConditionValue;
  facts: FactsLookup;
  constants: ConstantsLookup;
}) {
  if (Array.isArray(value)) {
    return (
      <div>
        <FactLabel factKey={factKey} /> contains:
        <BadgeList items={value} factKey={factKey} facts={facts} constants={constants} />
      </div>
    );
  }

  // Operator object, e.g. { in: [...] } or { equals: "x" }.
  if (value !== null && typeof value === "object") {
    const [operator, payload] = Object.entries(value)[0] ?? ["", undefined];
    const listLabel = LIST_OPERATORS[operator];
    if (listLabel && Array.isArray(payload)) {
      return (
        <div>
          <FactLabel factKey={factKey} /> {listLabel}:
          <BadgeList items={payload} factKey={factKey} facts={facts} constants={constants} />
        </div>
      );
    }
    const label = operator === "equals" || operator === "includes" ? "is" : operator || "matches";
    return (
      <div>
        <FactLabel factKey={factKey} /> {label}{" "}
        <span className="font-medium">{resolveItem(payload, factKey, facts, constants)}</span>
      </div>
    );
  }

  return (
    <div>
      <FactLabel factKey={factKey} /> is <span className="font-medium">{formatScalar(value)}</span>
    </div>
  );
}
