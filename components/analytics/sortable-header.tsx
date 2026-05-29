"use client";

import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type SortableHeaderProps = {
  label: string;
  descSort: string;
  ascSort: string;
  currentSort: string | undefined;
  onSort: (next: string | undefined) => void;
  align?: "left" | "right";
  className?: string;
  tooltip?: string;
};

// Click cycles: unset → DESC → ASC → unset. The header reports the next sort
// value to apply (or undefined to clear).
export function SortableHeader({
  label,
  descSort,
  ascSort,
  currentSort,
  onSort,
  align = "left",
  className,
  tooltip
}: SortableHeaderProps) {
  const isDesc = currentSort === descSort;
  const isAsc = currentSort === ascSort;
  const isActive = isDesc || isAsc;
  const Indicator = !isActive ? ChevronsUpDown : isDesc ? ArrowDown : ArrowUp;

  function handleClick() {
    onSort(isDesc ? ascSort : isAsc ? undefined : descSort);
  }

  const button = (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "inline-flex w-full cursor-pointer items-center gap-1 font-medium hover:text-foreground",
        isActive ? "text-foreground" : "text-muted-foreground",
        align === "right" ? "justify-end" : "justify-start"
      )}
    >
      <span>{label}</span>
      <Indicator className={cn("size-3", isActive ? "opacity-100" : "opacity-40")} />
    </button>
  );

  return (
    <TableHead className={className}>
      {tooltip ? (
        <TooltipProvider delayDuration={200} disableHoverableContent>
          <Tooltip>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent side="top" align="start" className="max-w-64">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        button
      )}
    </TableHead>
  );
}
