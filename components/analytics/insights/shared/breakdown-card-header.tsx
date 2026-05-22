"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  title: ReactNode;
  description: ReactNode;
  onRemove?: () => void;
};

export function BreakdownCardHeader({ title, description, onRemove }: Props) {
  return (
    <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
      <div>
        <CardTitle className="text-sm">{title}</CardTitle>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {onRemove && (
        <Button variant="ghost" size="icon" onClick={onRemove} aria-label="Remove" className="size-7">
          <X className="size-3.5" />
        </Button>
      )}
    </CardHeader>
  );
}
