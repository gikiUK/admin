"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFactName } from "@/lib/utils";
import type { TriState } from "./facts-mapping-types";
import { TriStateToggle } from "./tri-state-toggle";

type FactValueRowProps = {
  factId: string;
  value: string | boolean;
  onChange: (value: TriState) => void;
  onRemove: () => void;
};

export function FactValueRow({ factId, value, onChange, onRemove }: FactValueRowProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-56 truncate text-xs" title={factId}>
        {formatFactName(factId)}
      </span>
      <TriStateToggle value={value} onChange={onChange} />
      <Button variant="ghost" size="icon-xs" onClick={onRemove}>
        <X className="size-3" />
      </Button>
    </div>
  );
}
