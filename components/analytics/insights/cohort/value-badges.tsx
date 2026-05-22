"use client";

import { X } from "lucide-react";
import type { OptionPair } from "@/components/analytics/insights/cohort/fact-filter-options";
import { Badge } from "@/components/ui/badge";

type Props = {
  values: (string | number | boolean)[];
  options: OptionPair[];
  onRemove: (value: string | number | boolean) => void;
};

export function ValueBadges({ values, options, onRemove }: Props) {
  return (
    <>
      {values.map((value) => {
        const key = String(value);
        const label = options.find((o) => String(o.value) === key)?.label ?? key;
        return (
          <Badge key={key} variant="secondary" className="gap-1 pl-2 pr-1">
            {label}
            <button
              type="button"
              onClick={() => onRemove(value)}
              className="rounded hover:bg-muted-foreground/20"
              aria-label={`Remove ${label}`}
            >
              <X className="size-3" />
            </button>
          </Badge>
        );
      })}
    </>
  );
}
