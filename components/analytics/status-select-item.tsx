"use client";

import { SelectItem } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type StatusSelectItemProps = {
  value: string;
  label: string;
  description: string;
};

export function StatusSelectItem({ value, label, description }: StatusSelectItemProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <SelectItem value={value}>{label}</SelectItem>
      </TooltipTrigger>
      <TooltipContent side="right" align="center" className="max-w-64">
        {description}
      </TooltipContent>
    </Tooltip>
  );
}
